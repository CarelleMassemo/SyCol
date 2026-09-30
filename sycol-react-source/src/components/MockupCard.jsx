const LABELS = {
  dashboard: 'Tableau de bord analytique',
  ecommerce: 'Boutique e-commerce',
  landing: 'Landing page',
  mobile: 'Application mobile',
};

const Dots = () => (
  <div className="h-[26px] bg-[#EDEFF6] flex items-center gap-1.5 px-2.5 shrink-0">
    <span className="w-2 h-2 rounded-full bg-orange" />
    <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
    <span className="w-2 h-2 rounded-full bg-[#5AD98A]" />
  </div>
);

function Dashboard() {
  const heights = [40, 70, 55, 90, 35, 65];
  const grads = ['bg-sun-grad', 'bg-sky-grad', 'bg-gradient-to-br from-purple to-blue'];
  return (
    <div className="flex-1 p-3.5 flex flex-col gap-2.5">
      <div className="font-display font-bold text-[.82rem]">Tableau de bord — Ventes</div>
      <div className="flex items-end gap-1.5 h-[60px] flex-1">
        {heights.map((h, i) => (
          <span key={i} className={`flex-1 rounded-t ${grads[i % grads.length]}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
        <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
      </div>
    </div>
  );
}

function Ecommerce() {
  return (
    <div className="flex-1 p-3.5 flex flex-col gap-2.5">
      <div className="font-display font-bold text-[.82rem]">Boutique en ligne</div>
      <div className="flex gap-2 flex-1">
        <div className="flex-1 rounded-lg bg-sun-grad" />
        <div className="flex-1 rounded-lg bg-sky-grad" />
        <div className="flex-1 rounded-lg bg-gradient-to-br from-purple to-blue" />
      </div>
      <div className="h-[26px] rounded-lg bg-navy" />
    </div>
  );
}

function Landing() {
  return (
    <div className="flex-1 p-3.5 flex flex-col gap-2.5">
      <div className="h-[34%] rounded-lg bg-full-grad" />
      <div className="font-display font-bold text-[.82rem]">Landing page moderne</div>
      <div className="flex gap-2">
        <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
        <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
        <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
      </div>
    </div>
  );
}

function Mobile() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <div className="w-[58%] rounded-[22px] overflow-hidden border-[6px] border-navy aspect-[9/16] flex flex-col bg-white">
        <div className="h-4 bg-navy flex justify-center items-end pb-1">
          <div className="w-11 h-1.5 bg-black rounded" />
        </div>
        <div className="flex-1 p-3 flex flex-col gap-2.5">
          <div className="font-display font-bold text-[.82rem]">Appli mobile</div>
          <div className="h-[34%] rounded-lg bg-sky-grad" />
          <div className="flex gap-2">
            <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
            <div className="flex-1 h-[26px] rounded-lg bg-bg border border-line" />
          </div>
          <div className="h-[30px] rounded-lg bg-sun-grad mt-auto" />
        </div>
      </div>
    </div>
  );
}

const RENDERERS = { dashboard: Dashboard, ecommerce: Ecommerce, landing: Landing, mobile: Mobile };

export default function MockupCard({ kind }) {
  const Body = RENDERERS[kind];
  return (
    <div>
      <div className="rounded-2xl overflow-hidden border border-line bg-white aspect-[4/3] flex flex-col">
        <Dots />
        <Body />
      </div>
      <div className="text-center text-[.8rem] text-muted mt-2">{LABELS[kind]}</div>
    </div>
  );
}
