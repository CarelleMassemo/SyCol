import { ShoppingBag, Plug, Video, Code2, Blend, Star } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import useReviews from '../hooks/useReviews';

const ORBS = [
  { icon: Plug, pos: 'top-[8%] left-[8%]', grad: 'bg-sun-grad', delay: '0s' },
  { icon: Video, pos: 'top-[8%] right-[2%]', grad: 'bg-sky-grad', delay: '.6s' },
  { icon: Code2, pos: 'bottom-[16%] left-0', grad: 'bg-gradient-to-br from-purple to-blue', delay: '1.1s' },
  { icon: Blend, pos: 'bottom-[16%] right-[4%]', grad: 'bg-sun-grad', delay: '1.6s' },
  { icon: Star, pos: 'bottom-0 left-1/2 -translate-x-1/2', grad: 'bg-sky-grad', delay: '2s' },
];

export default function Hero() {
  const { average, reviews } = useReviews();

  return (
    <section id="accueil" className="relative overflow-hidden bg-navy-deep text-white pt-[170px] pb-[120px]">
      <div
        className="absolute -inset-[20%] blur-[10px] animate-drift"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(255,122,41,.35), transparent 42%), radial-gradient(circle at 85% 15%, rgba(41,171,226,.4), transparent 45%), radial-gradient(circle at 60% 80%, rgba(139,47,201,.32), transparent 45%)',
        }}
      />
      <div className="relative z-[2] max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div>
          <span className="eyebrow">5 talents, une seule énergie</span>
          <h1 className="text-[clamp(2.3rem,5vw,3.6rem)] leading-[1.08] text-white my-5">
            La synergie de nos forces individuelles, au service de{' '}
            <span className="bg-full-grad bg-clip-text text-transparent">votre quotidien.</span>
          </h1>
          <p className="text-[1.08rem] text-white/80 max-w-[520px] mb-9">
            SyCol conçoit, installe et livre : électroménager &amp; accessoires, caméras de surveillance,
            applications web &amp; mobiles, électricité. Une équipe, cinq expertises, un seul objectif : votre
            satisfaction.
          </p>
          <div className="flex gap-4 flex-wrap mb-12">
            <a href="#produits" className="btn-primary">
              <ShoppingBag size={18} /> Voir nos produits
            </a>
            <a href="#services" className="btn-light">
              Découvrir nos services
            </a>
          </div>
          <div className="flex gap-9 flex-wrap">
            <Stat value="5" label="Membres engagés" />
            <Stat value="4" label="Domaines d'expertise" />
            <Stat value={reviews.length ? `${average.toFixed(1)}/5` : '—'} label="Note moyenne clients" />
          </div>
        </div>

        <div className="relative aspect-square max-w-[460px] mx-auto">
          <svg viewBox="0 0 460 460" className="w-full h-full overflow-visible">
            <g stroke="rgba(255,255,255,.28)" strokeWidth="1.5" fill="none">
              <line x1="230" y1="230" x2="80" y2="90" />
              <line x1="230" y1="230" x2="380" y2="90" />
              <line x1="230" y1="230" x2="70" y2="330" />
              <line x1="230" y1="230" x2="390" y2="330" />
              <line x1="230" y1="230" x2="230" y2="410" />
            </g>
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[108px] h-[108px] rounded-[26px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,.55)] border-[3px] border-white/25">
            <img src={logo} alt="SyCol" className="w-full h-full object-cover" />
          </div>
          {ORBS.map(({ icon: Icon, pos, grad, delay }, i) => (
            <div
              key={i}
              className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_14px_30px_-8px_rgba(0,0,0,.5)] border-2 border-white/35 animate-floaty ${pos} ${grad}`}
              style={{ animationDelay: delay }}
            >
              <Icon size={22} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <strong className="block font-display text-2xl bg-full-grad bg-clip-text text-transparent">{value}</strong>
      <span className="text-[.8rem] text-white/60 font-mono tracking-wide">{label}</span>
    </div>
  );
}
