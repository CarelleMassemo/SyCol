import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'sycol.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// node:sqlite est intégré à Node.js (>=22.5) : pas de module natif à compiler,
// contrairement à better-sqlite3. Le fichier sycol.db est la vraie base de
// données, persistée sur disque — toutes les écritures y sont durables.
export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cat TEXT NOT NULL,
    price TEXT NOT NULL,
    icon TEXT NOT NULL,
    grad TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    grad TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_label TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS service_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    point TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS galleries (
    service_id TEXT PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
    eyebrow TEXT,
    title TEXT,
    note TEXT,
    type TEXT NOT NULL DEFAULT 'photo'
  );

  CREATE TABLE IF NOT EXISTS gallery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id TEXT NOT NULL REFERENCES galleries(service_id) ON DELETE CASCADE,
    src TEXT NOT NULL,
    caption TEXT,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    initials TEXT NOT NULL,
    grad TEXT NOT NULL,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service TEXT NOT NULL,
    comment TEXT NOT NULL,
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at INTEGER NOT NULL
  );

  -- Comptes clients (inscription/connexion pour suivre ses commandes).
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    orders_count INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  -- Commandes passées par un client connecté depuis son panier.
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items_json TEXT NOT NULL,
    subtotal INTEGER NOT NULL,
    discount INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL,
    promo_code TEXT,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );

  -- Codes promo débloqués automatiquement par la fidélité (voir loyalty.js).
  CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  -- Cartes de fidélité physiques (imprimées avec QR code, distribuées en
  -- boutique). Une carte est créée vierge (user_id NULL) puis "activée" —
  -- liée à un compte client — quand celui-ci scanne le QR code et
  -- crée son compte / se connecte depuis la page d'activation.
  CREATE TABLE IF NOT EXISTS loyalty_cards (
    code TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL,
    activated_at INTEGER
  );
`);

// Migration légère : ajoute les colonnes manquantes sur une base déjà créée
// par une version antérieure du schéma, sans jamais supprimer de données.
function ensureColumn(table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((c) => c.name === column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`[db] Colonne ajoutée : ${table}.${column}`);
  }
}

ensureColumn('products', 'image_url', 'TEXT');
ensureColumn('team_members', 'phone', 'TEXT');
ensureColumn('team_members', 'email', 'TEXT');
ensureColumn('team_members', 'bio', 'TEXT');
