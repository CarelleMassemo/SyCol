import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const teamRouter = Router();

// GET /api/team — liste publique
teamRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM team_members ORDER BY position, id').all();
  res.json(rows);
});

// POST /api/team — admin uniquement
teamRouter.post('/', adminAuth, (req, res) => {
  const { name, role, initials, grad, photoUrl = null, phone = null, email = null, bio = null, position = 0 } = req.body || {};
  if (!name || !role || !initials || !grad) {
    return res.status(400).json({ error: 'Champs requis : name, role, initials, grad.' });
  }
  const info = db
    .prepare(
      'INSERT INTO team_members (name, role, initials, grad, photo_url, phone, email, bio, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(name, role, initials, grad, photoUrl, phone, email, bio, position);
  res.status(201).json(db.prepare('SELECT * FROM team_members WHERE id = ?').get(info.lastInsertRowid));
});

// PUT /api/team/:id — admin uniquement
teamRouter.put('/:id', adminAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Membre introuvable.' });

  const body = req.body || {};
  const merged = {
    name: body.name ?? existing.name,
    role: body.role ?? existing.role,
    initials: body.initials ?? existing.initials,
    grad: body.grad ?? existing.grad,
    photoUrl: body.photoUrl ?? existing.photo_url,
    phone: body.phone ?? existing.phone,
    email: body.email ?? existing.email,
    bio: body.bio ?? existing.bio,
    position: body.position ?? existing.position,
  };
  db.prepare(
    'UPDATE team_members SET name = ?, role = ?, initials = ?, grad = ?, photo_url = ?, phone = ?, email = ?, bio = ?, position = ? WHERE id = ?'
  ).run(
    merged.name,
    merged.role,
    merged.initials,
    merged.grad,
    merged.photoUrl,
    merged.phone,
    merged.email,
    merged.bio,
    merged.position,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id));
});

// DELETE /api/team/:id — admin uniquement
teamRouter.delete('/:id', adminAuth, (req, res) => {
  const info = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Membre introuvable.' });
  res.status(204).end();
});
