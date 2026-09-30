import crypto from 'node:crypto';
import { db } from './db.js';

// Programme de fidélité SyCol :
//   - 1 point de fidélité par tranche de 1000 FCFA dépensée sur une commande.
//   - Un code promo (-10%) est généré automatiquement tous les 3 commandes
//     passées par un même client, pour l'inciter à revenir (et en parler
//     autour de lui, comme demandé).
// Ces règles sont volontairement simples à ajuster : modifiez POINTS_PER_FCFA,
// ORDERS_PER_PROMO ou PROMO_DISCOUNT_PERCENT ci-dessous si besoin.

const POINTS_PER_FCFA = 1 / 1000; // 1 point / 1000 FCFA dépensés
const ORDERS_PER_PROMO = 3; // 1 code promo débloqué tous les 3 commandes
const PROMO_DISCOUNT_PERCENT = 10;

function generateCode() {
  return `SYCOL${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// Appelé juste après la création d'une commande : met à jour les points de
// fidélité du client et, si le seuil est atteint, lui génère un nouveau code
// promo. Retourne le code promo créé (ou null si aucun ce coup-ci).
export function applyLoyalty(userId, orderTotal) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const earnedPoints = Math.floor(orderTotal * POINTS_PER_FCFA);
  const newOrdersCount = user.orders_count + 1;
  const newPoints = user.loyalty_points + earnedPoints;

  db.prepare('UPDATE users SET loyalty_points = ?, orders_count = ? WHERE id = ?').run(
    newPoints,
    newOrdersCount,
    userId
  );

  if (newOrdersCount % ORDERS_PER_PROMO === 0) {
    const code = generateCode();
    db.prepare(
      'INSERT INTO promo_codes (user_id, code, discount_percent, used, created_at) VALUES (?, ?, ?, 0, ?)'
    ).run(userId, code, PROMO_DISCOUNT_PERCENT, Date.now());
    return { code, discountPercent: PROMO_DISCOUNT_PERCENT };
  }

  return null;
}

// Vérifie un code promo pour un client donné (doit lui appartenir et ne pas
// avoir déjà été utilisé). Retourne le pourcentage de réduction, ou null.
export function checkPromoCode(userId, code) {
  if (!code) return null;
  const row = db
    .prepare('SELECT * FROM promo_codes WHERE user_id = ? AND code = ? AND used = 0')
    .get(userId, code.trim().toUpperCase());
  return row ? row.discount_percent : null;
}

export function markPromoCodeUsed(userId, code) {
  db.prepare('UPDATE promo_codes SET used = 1 WHERE user_id = ? AND code = ?').run(
    userId,
    code.trim().toUpperCase()
  );
}
