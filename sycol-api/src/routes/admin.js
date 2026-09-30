import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const adminRouter = Router();

// POST /api/admin/fix-media-urls — admin uniquement : réécrit en base les URLs
// de photos (produits, équipe, galeries) qui pointent encore vers une ancienne
// adresse (ex: http://localhost:4000, restée figée dans les données au moment
// du premier lancement/seed) vers l'adresse publique actuelle. Utile après un
// déploiement, ou si l'adresse du serveur change plus tard.
adminRouter.post('/fix-media-urls', adminAuth, (req, res) => {
  const oldBase = req.body?.oldBase || 'http://localhost:4000';
  const newBase = req.body?.newBase || process.env.PUBLIC_URL;
  if (!newBase) {
    return res.status(400).json({ error: 'newBase manquant (et PUBLIC_URL non défini sur le serveur).' });
  }

  const results = {};
  results.products = db
    .prepare("UPDATE products SET image_url = REPLACE(image_url, ?, ?) WHERE image_url LIKE ? || '%'")
    .run(oldBase, newBase, oldBase).changes;
  results.team_members = db
    .prepare("UPDATE team_members SET photo_url = REPLACE(photo_url, ?, ?) WHERE photo_url LIKE ? || '%'")
    .run(oldBase, newBase, oldBase).changes;
  results.gallery_items = db
    .prepare("UPDATE gallery_items SET src = REPLACE(src, ?, ?) WHERE src LIKE ? || '%'")
    .run(oldBase, newBase, oldBase).changes;

  res.json({ oldBase, newBase, updated: results });
});
