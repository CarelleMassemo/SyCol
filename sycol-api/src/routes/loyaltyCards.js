import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const loyaltyCardsRouter = Router();

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    loyaltyPoints: u.loyalty_points,
    ordersCount: u.orders_count,
  };
}

function generateCode() {
  // 8 caractères lisibles (sans 0/O/1/I pour éviter les confusions à l'oeil,
  // même si le client scanne — utile si le code doit un jour être ressaisi
  // à la main).
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return code;
}

// GET /api/loyalty-cards/:code — public : la page d'activation vérifie le
// statut de la carte avant d'afficher le formulaire.
loyaltyCardsRouter.get('/:code', (req, res) => {
  const card = db.prepare('SELECT * FROM loyalty_cards WHERE code = ?').get(req.params.code.toUpperCase());
  if (!card) return res.status(404).json({ error: 'Carte introuvable. Vérifiez le QR code ou contactez SyCol.' });
  res.json({
    code: card.code,
    activated: !!card.user_id,
    createdAt: card.created_at,
  });
});

// POST /api/loyalty-cards/:code/activate — le client connecté lie la carte
// physique qu'il vient de scanner à son compte (créé ou existant).
loyaltyCardsRouter.post('/:code/activate', requireAuth, (req, res) => {
  const code = req.params.code.toUpperCase();
  const card = db.prepare('SELECT * FROM loyalty_cards WHERE code = ?').get(code);
  if (!card) return res.status(404).json({ error: 'Carte introuvable. Vérifiez le QR code ou contactez SyCol.' });

  if (card.user_id && card.user_id !== req.userId) {
    return res.status(409).json({ error: 'Cette carte est déjà liée à un autre compte.' });
  }

  if (!card.user_id) {
    db.prepare('UPDATE loyalty_cards SET user_id = ?, activated_at = ? WHERE code = ?').run(
      req.userId,
      Date.now(),
      code
    );
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  res.json({ card: { code, activated: true }, user: publicUser(user) });
});

// POST /api/loyalty-cards/generate — admin uniquement : imprime un lot de
// cartes vierges (voir scripts/generate-loyalty-cards.js pour aussi
// générer les PNG des QR codes correspondants).
loyaltyCardsRouter.post('/generate', adminAuth, (req, res) => {
  const count = Math.max(1, Math.min(200, parseInt(req.body?.count, 10) || 1));
  const insert = db.prepare('INSERT INTO loyalty_cards (code, created_at) VALUES (?, ?)');
  const codes = [];
  for (let i = 0; i < count; i++) {
    let code;
    do {
      code = generateCode();
    } while (db.prepare('SELECT 1 FROM loyalty_cards WHERE code = ?').get(code));
    insert.run(code, Date.now());
    codes.push(code);
  }
  res.status(201).json({ codes });
});

// GET /api/loyalty-cards — admin uniquement : liste toutes les cartes (pour
// suivre lesquelles sont encore vierges / déjà activées).
loyaltyCardsRouter.get('/', adminAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT loyalty_cards.*, users.name AS user_name, users.email AS user_email
       FROM loyalty_cards LEFT JOIN users ON users.id = loyalty_cards.user_id
       ORDER BY loyalty_cards.created_at DESC`
    )
    .all();
  res.json(rows);
});
