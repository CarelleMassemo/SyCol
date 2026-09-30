import { Router } from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword, createToken, requireAuth } from '../auth.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  const pendingOrdersCount = db
    .prepare("SELECT COUNT(*) AS c FROM orders WHERE user_id = ? AND status = 'pending'")
    .get(u.id).c;
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    loyaltyPoints: u.loyalty_points,
    ordersCount: u.orders_count,
    pendingOrdersCount,
  };
}

// POST /api/auth/register — création de compte client
authRouter.post('/register', (req, res) => {
  const { name, phone, email, password } = req.body || {};
  if (!name?.trim() || !phone?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Champs requis : name, phone, email, password.' });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Email invalide.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
  }

  const info = db
    .prepare('INSERT INTO users (name, phone, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(name.trim(), phone.trim(), email.trim().toLowerCase(), hashPassword(password), Date.now());

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  const token = createToken(user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Champs requis : email, password.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
  }

  const token = createToken(user.id);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me — infos du client connecté
authRouter.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Compte introuvable.' });
  res.json(publicUser(user));
});
