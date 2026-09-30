import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const NAV = [
  { href: '#apropos', label: 'À propos' },
  { href: '#equipe', label: 'Équipe' },
  { href: '#produits', label: 'Produits' },
  { href: '#services', label: 'Services' },
];
const SERVICE_LINKS = [
  { href: '#services', label: 'Caméras de surveillance' },
  { href: '#services', label: 'Développement web & mobile' },
  { href: '#services', label: 'Électricité' },
];
const AVIS_LINKS = [
  { href: '#avis', label: 'Laisser un avis' },
  { href: '#contact', label: 'Nous contacter' },
];
const SOCIALS = [Facebook, Instagram, Linkedin, MessageCircle];

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white/70 pt-16 pb-7">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-11">
          <div>
            <div className="flex items-center gap-3 mb-3.5">
              <img src={logo} alt="SyCol" className="w-[38px] h-[38px] rounded-[10px] object-cover" />
              <span className="font-display font-bold text-white text-[1.1rem]">SyCol</span>
            </div>
            <p className="text-[.86rem] leading-7">
              Synergie Collective — la mise en commun de nos performances individuelles pour créer une valeur
              supérieure.
            </p>
            <div className="flex gap-2.5 mt-4">
              {SOCIALS.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/[.08] flex items-center justify-center hover:bg-full-grad transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Navigation" links={NAV} />
          <FooterCol title="Services" links={SERVICE_LINKS} />
          <FooterCol title="Avis & Contact" links={AVIS_LINKS} />
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-wrap justify-between gap-2.5 text-[.78rem]">
          <span>© 2026 SyCol — Synergie Collective. Tous droits réservés.</span>
          <span>Conçu avec ambition à Paris 🇫🇷</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h5 className="text-white text-[.82rem] uppercase tracking-wide mb-4 font-mono font-medium">{title}</h5>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label} className="text-[.86rem]">
            <a href={l.href} className="hover:text-cyan transition-colors">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
