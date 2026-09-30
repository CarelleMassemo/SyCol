import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { applyLoyalty, checkPromoCode, markPromoCodeUsed } from '../loyalty.js';
import { sendOrderNotification } from '../mailer.js';

export const ordersRouter = Router();

const PAYMENT_METHODS = ['orange_money', 'mtn_money', 'paypal', 'card', 'cash'];

function serializeOrder(row) {
  return { ...row, items: JSON.parse(row.items_json) };
}

// POST /api/orders — passer commande depuis le panier (client connecté).
// Le paiement réel (Orange Money / MTN Money / PayPal / CB) n'est pas encore
// branché sur un prestataire (aucun compte marchand pour l'instant) : la
// commande est enregistrée avec le statut "pending" et des instructions de
// paiement manuel sont renvoyées ; l'admin est notifié par email pour
// confirmer la réception du paiement. Voir mailer.js / PAYMENT_METHODS.
ordersRouter.post('/', requireAuth, async (req, res) => {
  const { items, paymentMethod, promoCode } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide.' });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ error: `paymentMethod doit être l'un de : ${PAYMENT_METHODS.join(', ')}.` });
  }

  const subtotal = items.reduce((sum, i) => {
    const price = parseInt(String(i.price).replace(/[^\d]/g, ''), 10) || 0;
    return sum + price * (i.qty || 1);
  }, 0);

  let discountPercent = 0;
  if (promoCode) {
    discountPercent = checkPromoCode(req.userId, promoCode);
    if (!discountPercent) {
      return res.status(400).json({ error: 'Code promo invalide, déjà utilisé, ou ne vous appartenant pas.' });
    }
  }
  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discount;

  const info = db
    .prepare(
      'INSERT INTO orders (user_id, items_json, subtotal, discount, total, promo_code, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      req.userId,
      JSON.stringify(items),
      subtotal,
      discount,
      total,
      promoCode || null,
      paymentMethod,
      'pending',
      Date.now()
    );

  if (promoCode) markPromoCodeUsed(req.userId, promoCode);
  const newPromo = applyLoyalty(req.userId, total);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);

  try {
    await sendOrderNotification({ order: serializeOrder(order), user });
  } catch (err) {
    console.error('[mailer] Échec notification nouvelle commande :', err.message);
  }

  res.status(201).json({
    order: serializeOrder(order),
    newPromoCode: newPromo,
    paymentInstructions: getPaymentInstructions(paymentMethod, total, order.id),
  });
});

// GET /api/orders — historique des commandes du client connecté
ordersRouter.get('/', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json(rows.map(serializeOrder));
});

// GET /api/orders/promo-codes — codes promo disponibles du client connecté
ordersRouter.get('/promo-codes', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM promo_codes WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json(rows);
});

// GET /api/orders/all — admin uniquement : toutes les commandes de tous les clients
ordersRouter.get('/all', adminAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT orders.*, users.name AS customer_name, users.phone AS customer_phone, users.email AS customer_email
       FROM orders JOIN users ON users.id = orders.user_id
       ORDER BY orders.created_at DESC`
    )
    .all();
  res.json(rows.map(serializeOrder));
});

// PUT /api/orders/:id/status — admin uniquement : confirmer un paiement reçu, etc.
ordersRouter.put('/:id/status', adminAuth, (req, res) => {
  const { status } = req.body || {};
  const valid = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `status doit être l'un de : ${valid.join(', ')}.` });
  }
  const info = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Commande introuvable.' });
  res.json(serializeOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)));
});

function getPaymentInstructions(method, total, orderId) {
  const ref = `SYCOL-${orderId}`;
  switch (method) {
    case 'orange_money':
      return `Effectuez un transfert Orange Money de ${total.toLocaleString('fr-FR')} FCFA au numéro communiqué par SyCol, en précisant la référence ${ref}. Votre commande sera confirmée après vérification du paiement.`;
    case 'mtn_money':
      return `Effectuez un transfert MTN Mobile Money de ${total.toLocaleString('fr-FR')} FCFA au numéro communiqué par SyCol, en précisant la référence ${ref}. Votre commande sera confirmée après vérification du paiement.`;
    case 'paypal':
      return `Le paiement PayPal en ligne n'est pas encore activé sur le site. Contactez SyCol en précisant la référence ${ref} pour finaliser le règlement.`;
    case 'card':
      return `Le paiement par carte bancaire en ligne n'est pas encore activé sur le site. Contactez SyCol en précisant la référence ${ref} pour finaliser le règlement.`;
    default:
      return `Réglez en espèces à la livraison. Référence de commande : ${ref}.`;
  }
}
