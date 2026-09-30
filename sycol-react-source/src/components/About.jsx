import { Users, ShieldCheck, MessageCircle } from 'lucide-react';
import useReveal from '../hooks/useReveal';

const CARDS = [
  {
    icon: Users,
    grad: 'bg-sun-grad',
    title: 'Une équipe, cinq expertises',
    text: "Chaque membre apporte une compétence complémentaire : technique, commerciale, créative et humaine.",
  },
  {
    icon: ShieldCheck,
    grad: 'bg-gradient-to-br from-purple to-blue',
    title: 'Sérieux & engagement',
    text: "Visages, rôles et responsabilités affichés en toute transparence sur notre page d'accueil.",
  },
  {
    icon: MessageCircle,
    grad: 'bg-sky-grad',
    title: 'Avis vérifiés',
    text: "Chaque client peut laisser un avis après réception d'un produit ou d'une prestation.",
  },
];

export default function About() {
  const [ref, visible] = useReveal();

  return (
    <section id="apropos" className="bg-white py-28">
      <div
        ref={ref}
        className={`max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-16 items-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div>
          <span className="eyebrow">Notre nom, notre mission</span>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)] mt-3.5">Pourquoi « Synergie Collective » ?</h2>
          <div className="flex flex-col gap-0.5 my-6">
            <div className="flex items-baseline gap-3.5">
              <span className="font-display font-bold text-[2.1rem] w-12 bg-full-grad bg-clip-text text-transparent">Sy</span>
              <span className="text-[1.05rem] text-muted font-medium">Synergie</span>
            </div>
            <div className="flex items-baseline gap-3.5">
              <span className="font-display font-bold text-[2.1rem] w-12 bg-full-grad bg-clip-text text-transparent">Col</span>
              <span className="text-[1.05rem] text-muted font-medium">Collective</span>
            </div>
          </div>
          <div className="relative mt-4 p-8 rounded-xl2 border border-line shadow-soft bg-gradient-to-b from-white to-[#FBF7FE]">
            <span className="absolute top-1.5 left-5 font-display text-6xl text-purple/25 leading-none">“</span>
            <p className="relative font-display text-[1.25rem] font-semibold">
              La mise en commun de nos performances individuelles pour créer une valeur supérieure.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {CARDS.map(({ icon: Icon, grad, title, text }) => (
            <div
              key={title}
              className="flex gap-4 p-5 bg-bg rounded-2xl border border-line transition-transform duration-300 hover:translate-x-1.5 hover:shadow-soft"
            >
              <div className={`w-11 h-11 min-w-[44px] rounded-xl flex items-center justify-center text-white ${grad}`}>
                <Icon size={20} />
              </div>
              <div>
                <h4 className="text-base mb-1">{title}</h4>
                <p className="text-[.88rem] text-muted m-0">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
