import { Router } from 'express';
import { db } from '../db.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { sendContactNotification, sendReplyToClient } from '../mailer.js';

export const contactRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — public : enregistre le message du formulaire de contact
// (envoyé aussi bien pour une question générale que pour une demande de devis,
// ex: bouton "Demander un devis" d'un service, qui pré-remplit ce formulaire).
// Le message est stocké en base ET un email de notification part vers
// ADMIN_EMAIL (voir .env) pour que l'admin soit prévenu immédiatement.
contactRouter.post('/', async (req, res) => {
  const { name, phone, email, message } = req.body || {};
  if (!name?.trim() || !phone?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Champs requis : name, phone, email, message.' });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'Email invalide.' });
  }

  const createdAt = Date.now();
  const info = db
    .prepare('INSERT INTO contact_messages (name, phone, email, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(name.trim(), phone.trim(), email.trim(), message.trim(), 'new', createdAt);

  const created = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(info.lastInsertRowid);

  try {
    await sendContactNotification({ name: name.trim(), phone: phone.trim(), email: email.trim(), message: message.trim() });
  } catch (err) {
    // On ne fait jamais échouer la requête à cause d'un souci d'email : le
    // message est déjà en sécurité dans la base, consultable via GET admin.
    console.error('[mailer] Échec envoi email de notification :', err.message);
  }

  res.status(201).json(created);
});

// GET /api/contact — admin uniquement : consulter les messages reçus
contactRouter.get('/', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
  res.json(rows);
});

// PUT /api/contact/:id — admin uniquement : marquer un message comme traité
contactRouter.put('/:id', adminAuth, (req, res) => {
  const existing = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Message introuvable.' });
  const status = req.body?.status ?? existing.status;
  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id));
});

// POST /api/contact/:id/reply — admin uniquement : répond au client par
// email directement depuis l'API (alternative à "Répondre" dans Gmail).
// Marque aussi le message comme "replied" en base.
contactRouter.post('/:id/reply', adminAuth, async (req, res) => {
  const existing = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Message introuvable.' });

  const replyMessage = req.body?.message?.trim();
  if (!replyMessage) return res.status(400).json({ error: 'Champ requis : message.' });

  try {
    await sendReplyToClient({ toEmail: existing.email, clientName: existing.name, replyMessage });
  } catch (err) {
    return res.status(502).json({ error: `Échec de l'envoi de la réponse : ${err.message}` });
  }

  db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run('replied', req.params.id);
  res.json(db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id));
});
