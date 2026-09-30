import { useEffect, useState } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import AccountDrawer from './AccountDrawer';

const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#apropos', label: 'À propos' },
  { href: '#equipe', label: 'Équipe' },
  { href: '#produits', label: 'Produits' },
  { href: '#services', label: 'Services' },
  { href: '#avis', label: 'Avis clients' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { totalCount } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] backdrop-blur-md transition-colors duration-300 ${
        scrolled ? 'bg-bg/95 border-b border-line' : 'bg-bg/80 border-b border-transparent'
      }`}
    >
      <nav className="max-w-[1180px] mx-auto flex items-center justify-between px-6 py-3.5">
        <a href="#accueil" className="flex items-center gap-3 font-display font-bold text-[1.15rem]">
          <img src={logo} alt="Logo SyCol" className="w-[42px] h-[42px] rounded-[11px] object-cover shadow-soft" />
          <span>
            SyCol
            <small className="block font-mono text-[.6rem] tracking-[.1em] text-muted font-medium uppercase mt-0.5">
              Synergie Collective
            </small>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-[.92rem] font-semibold relative group py-1">
                {l.label}
                <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-full-grad transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3.5">
          <a href="#contact" className="btn-ghost btn-sm hidden md:inline-flex">
            Devis gratuit
          </a>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Ouvrir le panier"
            className="relative p-1.5 hover:text-purple transition-colors"
          >
            <ShoppingCart size={22} />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red text-white text-[.62rem] font-bold flex items-center justify-center">
                {totalCount}
              </span>
            )}
            {user && user.pendingOrdersCount > 0 && (
              <span
                title={`${user.pendingOrdersCount} commande(s) en attente de paiement`}
                className="absolute -bottom-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-orange text-white text-[.58rem] font-bold flex items-center justify-center ring-2 ring-bg animate-pulse"
              >
                {user.pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => (user ? setAccountOpen(true) : setAuthOpen(true))}
            aria-label={user ? 'Mon compte' : 'Se connecter'}
            title={user ? user.name : 'Se connecter'}
            className="p-1.5 hover:text-purple transition-colors"
          >
            <User size={22} />
          </button>
          <button
            className="md:hidden p-1.5"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Menu mobile plein écran */}
      <div
        className={`md:hidden fixed top-[70px] inset-x-0 bottom-0 bg-white overflow-y-auto px-6 py-9 flex flex-col gap-6 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-lg font-semibold">
            {l.label}
          </a>
        ))}
      </div>

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {accountOpen && user && <AccountDrawer onClose={() => setAccountOpen(false)} />}
    </header>
  );
}
