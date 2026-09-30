import { lazy, Suspense, useEffect, useState } from 'react';
import { Video, Code2, Zap, Check, Images } from 'lucide-react';
import { fetchServices } from '../lib/api';
import { useApp } from '../context/AppContext';
import useReveal from '../hooks/useReveal';

// La modale (avec ses images) n'est chargée que lorsqu'on l'ouvre :
// ça allège le bundle initial envoyé au navigateur (meilleure performance).
const GalleryModal = lazy(() => import('./GalleryModal.jsx'));

const ICONS = { Video, Code2, Zap };

export default function Services() {
  const { prefillContact } = useApp();
  const [ref, visible] = useReveal();
  const [openKey, setOpenKey] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((data) => !cancelled && setServices(data))
      .catch(() => !cancelled && setServices([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const openService = services.find((s) => s.id === openKey) || null;

  return (
    <section id="services" className="relative overflow-hidden bg-navy-deep text-white py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 0%, rgba(41,171,226,.22), transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,122,41,.18), transparent 40%)',
        }}
      />
      <div className="relative z-10 max-w-[1180px] mx-auto px-6">
        <div className="section-head [&_h2]:text-white [&_p]:text-white/65">
          <span className="eyebrow">Nos prestations</span>
          <h2>Des services pensés pour durer</h2>
          <p>Installation, développement et électricité : trois métiers, une seule exigence de qualité.</p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {loading ? (
            <p className="col-span-full text-center text-white/65 text-sm">Chargement des services…</p>
          ) : (
            services.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <div
                  key={s.id}
                  className="flex flex-col h-full bg-white/5 border border-white/10 rounded-xl2 p-8 backdrop-blur transition-all duration-300 hover:bg-white/[.09] hover:-translate-y-2 hover:border-white/25"
                >
                  <div className={`w-[58px] h-[58px] rounded-2xl flex items-center justify-center text-white mb-5 ${s.grad}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-white text-[1.18rem] mb-2.5">{s.title}</h3>
                  <p className="text-white/65 text-[.92rem] mb-5 flex-1">{s.description}</p>
                  <ul className="flex flex-col gap-2 mb-5">
                    {s.points.map((pt) => (
                      <li key={pt} className="text-[.86rem] text-white/80 flex gap-2 items-start">
                        <Check size={13} className="text-cyan mt-0.5 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => prefillContact(s.contactLabel)} className="btn-light btn-sm">
                      Demander un devis
                    </button>
                    <button onClick={() => setOpenKey(s.id)} className="btn-outline-light btn-sm">
                      <Images size={15} /> Voir des exemples
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {openService && (
        <Suspense fallback={null}>
          <GalleryModal gallery={openService.gallery} onClose={() => setOpenKey(null)} />
        </Suspense>
      )}
    </section>
  );
}
