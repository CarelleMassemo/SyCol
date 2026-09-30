import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const servicesRouter = Router();

function getFullService(id) {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) return null;

  const points = db
    .prepare('SELECT point FROM service_points WHERE service_id = ? ORDER BY position, id')
    .all(id)
    .map((r) => r.point);

  const gallery = db.prepare('SELECT * FROM galleries WHERE service_id = ?').get(id);
  const items = gallery
    ? db
        .prepare('SELECT src, caption FROM gallery_items WHERE service_id = ? ORDER BY position, id')
        .all(id)
    : [];

  return {
    ...service,
    contactLabel: service.contact_label,
    points,
    gallery: gallery ? { ...gallery, items } : null,
  };
}

// GET /api/services — liste publique, avec points & galerie imbriqués
// (même forme que l'ancien src/data/services.js du frontend)
servicesRouter.get('/', (req, res) => {
  const ids = db.prepare('SELECT id FROM services ORDER BY position, id').all().map((r) => r.id);
  res.json(ids.map(getFullService));
});

// GET /api/services/:id
servicesRouter.get('/:id', (req, res) => {
  const service = getFullService(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service introuvable.' });
  res.json(service);
});

// POST /api/services — admin uniquement. Crée le service + ses points + sa galerie.
servicesRouter.post('/', adminAuth, (req, res) => {
  const { id, icon, grad, title, description, contactLabel, position = 0, points = [], gallery = null } = req.body || {};
  if (!id || !icon || !grad || !title || !description || !contactLabel) {
    return res.status(400).json({ error: 'Champs requis : id, icon, grad, title, description, contactLabel.' });
  }

  db.prepare(
    'INSERT INTO services (id, icon, grad, title, description, contact_label, position) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, icon, grad, title, description, contactLabel, position);

  const insertPoint = db.prepare('INSERT INTO service_points (service_id, point, position) VALUES (?, ?, ?)');
  points.forEach((p, i) => insertPoint.run(id, p, i));

  if (gallery) {
    db.prepare('INSERT INTO galleries (service_id, eyebrow, title, note, type) VALUES (?, ?, ?, ?, ?)').run(
      id,
      gallery.eyebrow || null,
      gallery.title || null,
      gallery.note || null,
      gallery.type || 'photo'
    );
    const insertItem = db.prepare('INSERT INTO gallery_items (service_id, src, caption, position) VALUES (?, ?, ?, ?)');
    (gallery.items || []).forEach((it, i) => insertItem.run(id, it.src, it.caption || null, i));
  }

  res.status(201).json(getFullService(id));
});

// PUT /api/services/:id — admin uniquement. Met à jour les champs de base,
// et remplace entièrement points/galerie si fournis dans le body.
servicesRouter.put('/:id', adminAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Service introuvable.' });

  const body = req.body || {};
  const merged = {
    icon: body.icon ?? existing.icon,
    grad: body.grad ?? existing.grad,
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    contactLabel: body.contactLabel ?? existing.contact_label,
    position: body.position ?? existing.position,
  };
  db.prepare(
    'UPDATE services SET icon = ?, grad = ?, title = ?, description = ?, contact_label = ?, position = ? WHERE id = ?'
  ).run(merged.icon, merged.grad, merged.title, merged.description, merged.contactLabel, merged.position, req.params.id);

  if (Array.isArray(body.points)) {
    db.prepare('DELETE FROM service_points WHERE service_id = ?').run(req.params.id);
    const insertPoint = db.prepare('INSERT INTO service_points (service_id, point, position) VALUES (?, ?, ?)');
    body.points.forEach((p, i) => insertPoint.run(req.params.id, p, i));
  }

  if (body.gallery) {
    db.prepare('DELETE FROM gallery_items WHERE service_id = ?').run(req.params.id);
    db.prepare('DELETE FROM galleries WHERE service_id = ?').run(req.params.id);
    db.prepare('INSERT INTO galleries (service_id, eyebrow, title, note, type) VALUES (?, ?, ?, ?, ?)').run(
      req.params.id,
      body.gallery.eyebrow || null,
      body.gallery.title || null,
      body.gallery.note || null,
      body.gallery.type || 'photo'
    );
    const insertItem = db.prepare('INSERT INTO gallery_items (service_id, src, caption, position) VALUES (?, ?, ?, ?)');
    (body.gallery.items || []).forEach((it, i) => insertItem.run(req.params.id, it.src, it.caption || null, i));
  }

  res.json(getFullService(req.params.id));
});

// DELETE /api/services/:id — admin uniquement (les points/galerie sont
// supprimés automatiquement via ON DELETE CASCADE)
servicesRouter.delete('/:id', adminAuth, (req, res) => {
  const info = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Service introuvable.' });
  res.status(204).end();
});
