import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { seedDatabase } from './seed.js';
import { productsRouter } from './routes/products.js';
import { servicesRouter } from './routes/services.js';
import { teamRouter } from './routes/team.js';
import { reviewsRouter } from './routes/reviews.js';
import { contactRouter } from './routes/contact.js';
import { authRouter } from './routes/auth.js';
import { ordersRouter } from './routes/orders.js';
import { loyaltyCardsRouter } from './routes/loyaltyCards.js';

// Peuple la base au premier démarrage (ne fait rien si des données existent déjà)
seedDatabase();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// Ajoute automatiquement les adresses IP locales (Wi-Fi/hotspot) de cette
// machine, pour qu'un téléphone sur le même réseau puisse ouvrir le site
// (ex: en scannant un QR code de carte de fidélité) sans avoir à modifier
// CORS_ORIGIN à chaque fois que l'IP locale change.
for (const iface of Object.values(os.networkInterfaces()).flat()) {
  if (iface && iface.family === 'IPv4' && !iface.internal) {
    allowedOrigins.push(`http://${iface.address}:5173`);
  }
}

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// Sert les photos produit envoyées par l'admin (sycol-api/public/...) sur
// http://localhost:4000/products/<fichier>.jpg — référencées depuis la base
// via image_url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'sqlite' });
});

app.use('/api/products', productsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/team', teamRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/loyalty-cards', loyaltyCardsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

app.listen(PORT, () => {
  console.log(`[sycol-api] Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[sycol-api] Origines autorisées : ${allowedOrigins.join(', ')}`);
});
