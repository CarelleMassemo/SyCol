import { memo, useEffect, useMemo, useState } from 'react';
import {
  Refrigerator,
  WashingMachine,
  Fan,
  Flame,
  Blend,
  UtensilsCrossed,
  Wind,
  Plug,
  Package,
  ShoppingCart,
  Headphones,
  Bluetooth,
  Scissors,
  Camera,
  Mic,
  Mic2,
  Cable,
  Zap,
  BatteryCharging,
  Sun,
  Calculator,
} from 'lucide-react';
import { fetchProducts } from '../lib/api';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import useReveal from '../hooks/useReveal';

const ICONS = {
  Refrigerator,
  WashingMachine,
  Fan,
  Flame,
  Blend,
  UtensilsCrossed,
  Wind,
  Plug,
  Package,
  Headphones,
  Bluetooth,
  Scissors,
  Camera,
  Mic,
  Mic2,
  Cable,
  Zap,
  BatteryCharging,
  Sun,
  Calculator,
};

const ProductCard = memo(function ProductCard({ p }) {
  const { showToast } = useApp();
  const { addItem } = useCart();
  const Icon = ICONS[p.icon] || Package;

  const handleAddToCart = () => {
    addItem(p);
    showToast(`« ${p.name} » ajouté au panier ✓`);
  };

  return (
    <div className="card overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-soft">
      <div className={`aspect-[4/3] flex items-center justify-center relative text-white overflow-hidden ${p.grad}`}>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={44} strokeWidth={1.6} />
        )}
      </div>
      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <h4 className="text-[1.02rem]">{p.name}</h4>
        <p className="text-[.85rem] text-muted flex-1">{p.description}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-mono font-semibold text-[1.02rem]">{p.price}</span>
          <button
            onClick={handleAddToCart}
            title="Ajouter au panier"
            className="w-[38px] h-[38px] rounded-full bg-navy text-white flex items-center justify-center transition-all duration-300 hover:bg-purple hover:scale-110"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

function ProductGrid({ products, loading, emptyLabel }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {loading ? (
        <p className="col-span-full text-center text-muted text-sm">Chargement…</p>
      ) : products.length === 0 ? (
        <p className="col-span-full text-center text-muted text-sm">{emptyLabel}</p>
      ) : (
        products.map((p) => <ProductCard key={p.id} p={p} />)
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((data) => !cancelled && setProducts(data))
      .catch(() => !cancelled && setProducts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const appliances = useMemo(() => products.filter((p) => p.cat === 'Électroménager'), [products]);
  const accessories = useMemo(() => products.filter((p) => p.cat === 'Accessoires'), [products]);

  return (
    <section id="produits" className="relative overflow-hidden py-28">
      <div className="absolute inset-0 bg-navy-deep/[0.025]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 0%, rgba(41,171,226,.07), transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,122,41,.06), transparent 40%)',
        }}
      />
      <div className="relative z-10 max-w-[1180px] mx-auto px-6">
        <div className="section-head">
          <span className="eyebrow">Boutique SyCol</span>
          <h2>Électroménager & accessoires</h2>
          <p>
            Une sélection d'appareils fiables et d'accessoires du quotidien. Cliquez sur le panier pour être
            recontacté rapidement.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-[1.3rem] mb-5">Électroménager</h3>
          <ProductGrid products={appliances} loading={loading} emptyLabel="Aucun appareil pour le moment." />
        </div>

        <div className="mt-16">
          <h3 className="text-[1.3rem] mb-5">Accessoires</h3>
          <ProductGrid products={accessories} loading={loading} emptyLabel="Aucun accessoire pour le moment." />
        </div>
      </div>
    </section>
  );
}
