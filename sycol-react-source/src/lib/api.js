// Client léger vers l'API SyCol (voir dossier sycol-api/ à la racine du
// projet). VITE_API_URL (voir .env.example) permet de forcer une URL fixe
// (ex: en production). En dev, on retombe sur le même hôte que la page
// actuelle (port 4000) : ça marche aussi bien depuis "localhost" que depuis
// l'IP locale (ex: un téléphone qui scanne un QR code de carte de fidélité
// sur le même réseau Wi-Fi).
const API_BASE =
  import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000/api`;

async function request(path, options = {}) {
  const token = localStorage.getItem('sycol_token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* réponse sans corps JSON */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const fetchProducts = () => request('/products');
export const fetchServices = () => request('/services');
export const fetchTeam = () => request('/team');
export const fetchReviews = () => request('/reviews');

export const postReview = (review) =>
  request('/reviews', { method: 'POST', body: JSON.stringify(review) });

export const postContact = (payload) =>
  request('/contact', { method: 'POST', body: JSON.stringify(payload) });

// --- Comptes clients & commandes ---
export const registerUser = (payload) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const loginUser = (payload) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });

export const fetchMe = () => request('/auth/me');

export const createOrder = (payload) =>
  request('/orders', { method: 'POST', body: JSON.stringify(payload) });

export const fetchMyOrders = () => request('/orders');

export const fetchMyPromoCodes = () => request('/orders/promo-codes');

// --- Carte de fidélité physique (QR code) ---
export const fetchLoyaltyCard = (code) => request(`/loyalty-cards/${code}`);

export const activateLoyaltyCard = (code) =>
  request(`/loyalty-cards/${code}/activate`, { method: 'POST' });
