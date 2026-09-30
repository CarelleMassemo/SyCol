import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const reviewsRouter = Router();

// GET /api/reviews — public, visible par tous les visiteurs (contrairement à
// l'ancien localStorage qui était propre à chaque navigateur)
reviewsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(rows.map((r) => ({ ...r, ts: r.created_at })));
});

// POST /api/reviews — public : n'importe quel visiteur peut publier un avis
reviewsRouter.post('/', (req, res) => {
  const { name, service, comment, stars } = req.body || {};
  const starsNum = Number(stars);

  if (!name?.trim() || !service?.trim() || !comment?.trim()) {
    return res.status(400).json({ error: 'Champs requis : name, service, comment.' });
  }
  if (!Number.isInteger(starsNum) || starsNum < 1 || starsNum > 5) {
    return res.status(400).json({ error: 'stars doit être un entier entre 1 et 5.' });
  }

  const createdAt = Date.now();
  const info = db
    .prepare('INSERT INTO reviews (name, service, comment, stars, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(name.trim(), service.trim(), comment.trim(), starsNum, createdAt);

  const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...created, ts: created.created_at });
});

// DELETE /api/reviews/:id — admin uniquement (modération d'un avis abusif)
reviewsRouter.delete('/:id', adminAuth, (req, res) => {
  const info = db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Avis introuvable.' });
  res.status(204).end();
});
