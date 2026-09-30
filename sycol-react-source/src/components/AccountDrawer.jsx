import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Award, Package, LogOut, Copy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { fetchMyOrders, fetchMyPromoCodes } from '../lib/api';

const STATUS_LABELS = {
  pending: 'En attente de paiement',
  confirmed: 'Confirmée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const PAYMENT_LABELS = {
  orange_money: 'Orange Money',
  mtn_money: 'MTN Mobile Money',
  paypal: 'PayPal',
  card: 'Carte bancaire',
  cash: 'Espèces à la livraison',
};

export default function AccountDrawer({ onClose }) {
  const { user, logout } = useAuth();
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    Promise.all([fetchMyOrders(), fetchMyPromoCodes()])
      .then(([o, p]) => {
        setOrders(o);
        setPromoCodes(p);
      })
      .catch(() => showToast("Impossible de charger votre compte pour le moment ✗"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    showToast(`Code ${code} copié ✓`);
  };

  const handleLogout = () => {
    logout();
    showToast('Déconnecté ✓');
    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-navy-deep/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[22px] max-w-[440px] w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-soft animate-fadeUp">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl flex items-center gap-2">
            <User size={20} /> Mon compte
          </h3>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-bg border border-line flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="bg-bg border border-line rounded-2xl p-4 mb-6">
          <h4 className="text-[1rem]">{user.name}</h4>
          <p className="text-[.82rem] text-muted">{user.email} · {user.phone}</p>
        </div>

        {/* Carte de fidélité */}
        <div className="bg-full-grad text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} />
            <h4 className="text-[1rem] font-semibold">Carte de fidélité SyCol</h4>
          </div>
          <div className="flex items-end justify-between mb-1">
            <span className="text-[.82rem] opacity-90">Points cumulés</span>
            <span className="font-mono font-bold text-xl">{user.loyaltyPoints}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[.82rem] opacity-90">Commandes passées</span>
            <span className="font-mono font-bold">{user.ordersCount}</span>
          </div>
          <p className="text-[.76rem] opacity-85 mt-3">
            1 point tous les 1 000 FCFA dépensés. Un code promo -10% est débloqué tous les 3 commandes.
          </p>
        </div>

        {user.pendingOrdersCount > 0 && (
          <div className="flex items-start gap-2.5 bg-orange/10 border border-orange/40 text-orange rounded-xl px-3.5 py-3 mb-6 text-[.84rem]">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Vous avez <strong>{user.pendingOrdersCount}</strong> commande{user.pendingOrdersCount > 1 ? 's' : ''} en attente de paiement. Pensez à finaliser le règlement.
            </span>
          </div>
        )}

        {promoCodes.filter((p) => !p.used).length > 0 && (
          <div className="mb-6">
            <h4 className="text-[.92rem] mb-2.5">Vos codes promo disponibles</h4>
            <div className="flex flex-col gap-2">
              {promoCodes
                .filter((p) => !p.used)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleCopy(p.code)}
                    className="flex items-center justify-between border border-dashed border-purple/50 bg-purple/5 rounded-xl px-3.5 py-2.5 hover:bg-purple/10 transition-colors"
                  >
                    <span className="font-mono font-semibold text-purple">{p.code}</span>
                    <span className="flex items-center gap-1.5 text-[.78rem] text-purple">
                      -{p.discount_percent}% <Copy size={13} />
                    </span>
                  </button>
                ))}
            </div>
          </div>
        )}

        <h4 className="text-[.92rem] mb-2.5 flex items-center gap-1.5">
          <Package size={15} /> Historique de commandes
        </h4>
        {loading ? (
          <p className="text-muted text-sm text-center py-8">Chargement…</p>
        ) : orders.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">Aucune commande pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {orders.map((o) => (
              <div key={o.id} className="border border-line rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[.8rem] text-muted">
                    #{o.id} · {new Date(o.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-[.72rem] font-mono uppercase tracking-wide bg-bg px-2 py-0.5 rounded-full">
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
                <ul className="text-[.85rem] mb-2">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.qty}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-[.85rem]">
                  <span className="text-muted">{PAYMENT_LABELS[o.payment_method] || o.payment_method}</span>
                  <span className="font-mono font-semibold">{o.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-[.85rem] text-red border border-red/30 rounded-xl py-2.5 w-full hover:bg-red hover:text-white transition-colors"
        >
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>,
    document.body
  );
}
