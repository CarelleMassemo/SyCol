import crypto from 'node:crypto';

// Authentification "maison" avec seulement node:crypto (déjà intégré à
// Node.js) — pas besoin d'ajouter bcrypt ni jsonwebtoken comme dépendances.
//
// - Mots de passe : hachés avec scrypt (résistant au brute-force), jamais
//   stockés en clair.
// - Sessions : jeton signé (HMAC-SHA256) contenant l'id utilisateur + une
//   date d'expiration. Le secret de signature vient de AUTH_SECRET (.env) ;
//   à défaut, ADMIN_KEY est réutilisé pour ne pas bloquer le démarrage en dev.

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_KEY || 'sycol-dev-secret-non-securise';
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(candidate, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

export function createToken(userId) {
  const payload = JSON.stringify({ uid: userId, exp: Date.now() + TOKEN_TTL_MS });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload; // { uid, exp }
  } catch {
    return null;
  }
}

// Middleware Express : exige un client connecté (en-tête Authorization: Bearer <token>).
export function requireAuth(req, res, next) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Non connecté ou session expirée.' });
  req.userId = payload.uid;
  next();
}
