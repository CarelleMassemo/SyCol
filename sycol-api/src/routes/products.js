import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const productsRouter = Router();

// GET /api/products — liste publique, triée pour l'affichage
productsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY position, id').all();
  res.json(rows);
});

// POST /api/products — admin uniquement
productsRouter.post('/', adminAuth, (req, res) => {
  const { name, cat, price, icon, grad, description, imageUrl = null, position = 0 } = req.body || {};
  if (!name || !cat || !price || !icon || !grad || !description) {
    return res.status(400).json({ error: 'Champs requis : name, cat, price, icon, grad, description.' });
  }
  const info = db
    .prepare('INSERT INTO products (name, cat, price, icon, grad, description, image_url, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(name, cat, price, icon, grad, description, imageUrl, position);
  const created = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/products/:id — admin uniquement
productsRouter.put('/:id', adminAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produit introuvable.' });

  const body = req.body || {};
  const merged = {
    name: body.name ?? existing.name,
    cat: body.cat ?? existing.cat,
    price: body.price ?? existing.price,
    icon: body.icon ?? existing.icon,
    grad: body.grad ?? existing.grad,
    description: body.description ?? existing.description,
    imageUrl: body.imageUrl ?? existing.image_url,
    position: body.position ?? existing.position,
  };
  db.prepare(
    'UPDATE products SET name = ?, cat = ?, price = ?, icon = ?, grad = ?, description = ?, image_url = ?, position = ? WHERE id = ?'
  ).run(merged.name, merged.cat, merged.price, merged.icon, merged.grad, merged.description, merged.imageUrl, merged.position, req.params.id);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE /api/products/:id — admin uniquement
productsRouter.delete('/:id', adminAuth, (req, res) => {
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Produit introuvable.' });
  res.status(204).end();
});
