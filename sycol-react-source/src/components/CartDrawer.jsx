import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Smartphone,
  Wallet,
  CreditCard,
  Banknote,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useCart, formatFCFA, parsePrice } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../lib/api';

const PAYMENT_METHODS = [
  { id: 'orange_money', label: 'Orange Money', short: 'OM', icon: Smartphone, badgeClass: 'bg-[#FF6600] text-white' },
  { id: 'mtn_money', label: 'MTN MoMo', short: 'MoMo', icon: Smartphone, badgeClass: 'bg-[#FFCC00] text-navy-deep' },
  { id: 'paypal', label: 'PayPal', short: 'PayPal', icon: Wallet, badgeClass: 'bg-[#003087] text-white' },
  { id: 'card', label: 'Carte bancaire', short: 'CB', icon: CreditCard, badgeClass: 'bg-navy text-white' },
  { id: 'cash', label: 'À la livraison', short: 'Cash', icon: Banknote, badgeClass: 'bg-bg text-navy border border-line' },
];

const STEPS = ['Panier', 'Récapitulatif', 'Paiement', 'Confirmation'];

function Breadcrumb({ activeIndex }) {
  return (
    <div className="flex items-center flex-wrap gap-1.5 text-[.8rem] font-semibold">
      {STEPS.map((step, i) => (
        <span key={step} className="flex items-center gap-1.5">
          <span className={i === activeIndex ? 'text-navy' : 'text-muted'}>{step.toUpperCase()}</span>
          {i < STEPS.length - 1 && <ChevronRight size={14} className="text-line" />}
        </span>
      ))}
    </div>
  );
}

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, clearCart } = useCart();
  const { setContactMessage, showToast } = useApp();
  const { user, refreshUser } = useAuth();

  const [selected, setSelected] = useState(() => new Set(items.map((i) => i.id)));
  const [paymentMethod, setPaymentMethod] = useState('orange_money');
  const [promoCode, setPromoCode] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    setSelected((prev) => {
      const ids = new Set(items.map((i) => i.id));
      const next = new Set([...prev].filter((id) => ids.has(id)));
      items.forEach((i) => {
        if (!prev.has(i.id) && !next.has(i.id)) next.add(i.id);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(',')]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const selectedItems = useMemo(() => items.filter((i) => selected.has(i.id)), [items, selected]);
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, i) => sum + parsePrice(i.price) * i.qty, 0),
    [selectedItems]
  );
  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleItem = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const handleRequestQuote = () => {
    if (selectedItems.length === 0) return;
    const lines = selectedItems.map(
      (i) => `- ${i.name} x${i.qty} = ${formatFCFA(parsePrice(i.price) * i.qty)}`
    );
    const message = [
      'Bonjour SyCol, je souhaite obtenir un devis pour les articles suivants :',
      '',
      ...lines,
      '',
      `Total estimé : ${formatFCFA(selectedTotal)}`,
    ].join('\n');
    setContactMessage(message);
    onClose();
    showToast('Récapitulatif ajouté au message — complétez vos coordonnées ✓');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;
    setPlacing(true);
    try {
      const payload = {
        items: selectedItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        paymentMethod,
        ...(promoCode.trim() ? { promoCode: promoCode.trim() } : {}),
      };
      const result = await createOrder(payload);
      setOrderResult(result);
      selectedItems.forEach((i) => removeItem(i.id));
      refreshUser();
      if (result.newPromoCode) {
        showToast(`Commande passée ✓ — code promo -${result.newPromoCode.discountPercent}% débloqué : ${result.newPromoCode.code} 🎉`);
      } else {
        showToast('Commande passée avec succès ✓');
      }
    } catch (err) {
      showToast(`Erreur : ${err.message} ✗`);
    } finally {
      setPlacing(false);
    }
  };

  if (orderResult) {
    return createPortal(
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-navy-deep/85 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-[22px] max-w-[440px] w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-soft animate-fadeUp">
          <Breadcrumb activeIndex={3} />
          <div className="flex items-center justify-between mt-4 mb-6">
            <h3 className="text-xl">Commande confirmée</h3>
            <button onClick={onClose} aria-label="Fermer" className="w-9 h-9 rounded-full bg-bg border border-line flex items-center justify-center hover:bg-navy hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <p className="text-[.92rem] mb-4">
            Votre commande <strong>#{orderResult.order.id}</strong> a bien été enregistrée. Total :{' '}
            <strong>{formatFCFA(orderResult.order.total)}</strong>.
          </p>
          <div className="bg-bg border border-line rounded-xl p-4 text-[.88rem]">
            {orderResult.paymentInstructions}
          </div>
          {orderResult.newPromoCode && (
            <div className="mt-4 bg-purple/5 border border-dashed border-purple/50 rounded-xl p-4 text-[.88rem]">
              🎉 Vous avez débloqué un code promo <strong className="font-mono">{orderResult.newPromoCode.code}</strong> (-{orderResult.newPromoCode.discountPercent}%) pour votre prochaine commande !
            </div>
          )}
          <button onClick={onClose} className="btn-primary justify-center w-full mt-6">
            Fermer
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-navy-deep/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[22px] max-w-[1120px] w-full max-h-[92vh] overflow-hidden shadow-soft animate-fadeUp flex flex-col">
        {/* En-tête façon breadcrumb e-commerce */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-line shrink-0">
          <Breadcrumb activeIndex={items.length === 0 ? 0 : 1} />
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-bg border border-line flex items-center justify-center hover:bg-navy hover:text-white transition-colors shrink-0 ml-4"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {items.length === 0 ? (
            <p className="text-muted text-sm text-center py-16 px-6">
              Votre panier est vide. Ajoutez des produits depuis la boutique pour commander ou demander un devis.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
              {/* Colonne articles */}
              <div className="px-6 sm:px-8 py-6 lg:border-r border-line">
                <div className="flex items-center justify-between mb-5">
                  <label className="flex items-center gap-2.5 text-[.95rem] font-semibold cursor-pointer select-none">
                    <span
                      onClick={toggleAll}
                      className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${
                        allSelected ? 'bg-navy border-navy text-white' : 'border-line'
                      }`}
                    >
                      {allSelected && <Check size={13} />}
                    </span>
                    <span onClick={toggleAll}>TOUS LES ARTICLES ({items.length})</span>
                  </label>
                </div>

                <div className="flex flex-col gap-3.5">
                  {items.map((it) => {
                    const isSelected = selected.has(it.id);
                    return (
                      <div
                        key={it.id}
                        className={`flex gap-3 border rounded-xl p-3 transition-colors ${
                          isSelected ? 'border-line' : 'border-line opacity-50'
                        }`}
                      >
                        <button
                          onClick={() => toggleItem(it.id)}
                          aria-label={isSelected ? "Désélectionner l'article" : "Sélectionner l'article"}
                          className={`self-start mt-1 w-[18px] h-[18px] rounded-[5px] border shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-navy border-navy text-white' : 'border-line'
                          }`}
                        >
                          {isSelected && <Check size={13} />}
                        </button>
                        <div className="w-16 h-16 rounded-lg bg-bg overflow-hidden shrink-0 flex items-center justify-center">
                          {it.image_url ? (
                            <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart size={20} className="text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[.92rem] leading-snug">{it.name}</h4>
                          <p className="font-mono text-[.82rem] text-muted mt-0.5">{it.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQty(it.id, it.qty - 1)}
                              aria-label="Diminuer la quantité"
                              className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-bg"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm w-5 text-center">{it.qty}</span>
                            <button
                              onClick={() => updateQty(it.id, it.qty + 1)}
                              aria-label="Augmenter la quantité"
                              className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-bg"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(it.id)}
                              aria-label="Supprimer l'article"
                              title="Supprimer"
                              className="ml-auto w-7 h-7 rounded-full border border-line flex items-center justify-center text-red hover:bg-red hover:text-white hover:border-red transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={clearCart}
                  className="text-[.8rem] text-muted underline mt-5 hover:text-navy"
                >
                  Vider le panier
                </button>
              </div>

              {/* Colonne résumé de commande (sticky, façon Shein) */}
              <div className="px-6 sm:px-8 py-6 bg-bg lg:sticky lg:top-0 self-start">
                <h4 className="text-[1.05rem] font-semibold mb-4">Résumé de votre commande</h4>

                <div className="flex items-end justify-between mb-5">
                  <span className="text-muted text-sm">
                    Sous-total {selected.size < items.length && `(${selected.size} article${selected.size > 1 ? 's' : ''})`}
                  </span>
                  <span className="font-mono font-bold text-xl">{formatFCFA(selectedTotal)}</span>
                </div>

                {user ? (
                  <>
                    <h5 className="text-[.82rem] font-semibold text-muted uppercase tracking-wide mb-2.5">
                      Moyen de paiement
                    </h5>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {PAYMENT_METHODS.map(({ id, label, short, icon: Icon, badgeClass }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-[.78rem] font-semibold border-2 transition-colors ${
                            paymentMethod === id ? 'border-navy bg-white' : 'border-transparent bg-white/70 hover:bg-white'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${badgeClass}`}>
                            <Icon size={14} />
                          </span>
                          <span className="truncate text-left">{label}</span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Code promo (optionnel)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="input-field w-full mb-4"
                    />

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing || selectedItems.length === 0}
                      className="btn-primary justify-center w-full disabled:opacity-60"
                    >
                      {placing ? 'Envoi…' : 'Passer au paiement'}
                    </button>
                    <p className="text-[.74rem] text-muted text-center mt-2.5">
                      Les instructions de paiement s'affichent après validation.
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRequestQuote}
                      disabled={selectedItems.length === 0}
                      className="btn-primary justify-center w-full disabled:opacity-60"
                    >
                      Demander un devis pour ce panier
                    </button>
                    <p className="text-[.78rem] text-muted text-center mt-3">
                      <button
                        onClick={() => {
                          onClose();
                          showToast('Connectez-vous pour passer commande directement et cumuler des points fidélité');
                        }}
                        className="underline hover:text-navy"
                      >
                        Connectez-vous
                      </button>{' '}
                      pour commander directement et cumuler des points de fidélité.
                    </p>
                  </>
                )}

                <div className="border-t border-line mt-6 pt-5">
                  <h5 className="text-[.72rem] font-semibold text-muted uppercase tracking-wide mb-3">
                    Nous acceptons
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_METHODS.map(({ id, short, badgeClass }) => (
                      <span
                        key={id}
                        className={`px-2.5 py-1.5 rounded-md text-[.68rem] font-bold tracking-wide ${badgeClass}`}
                      >
                        {short}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
