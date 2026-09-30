import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info } from 'lucide-react';
import MockupCard from './MockupCard.jsx';

export default function GalleryModal({ gallery, onClose }) {
  const g = gallery;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!g) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-navy-deep/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[22px] max-w-[920px] w-full max-h-[92vh] overflow-y-auto p-9 relative animate-fadeUp">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 w-[38px] h-[38px] rounded-full bg-bg border border-line flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <span className="eyebrow mb-2.5">{g.eyebrow}</span>
        <h3 className="text-2xl mb-2 pr-10">{g.title}</h3>
        <div className="text-[.84rem] text-muted bg-bg border border-dashed border-line rounded-xl px-4 py-3 mb-6 flex gap-2.5 items-start">
          <Info size={16} className="text-purple mt-0.5 shrink-0" />
          <span>{g.note}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {g.type === 'photo'
            ? g.items.map((it) => (
                <div key={it.src} className="rounded-2xl overflow-hidden border border-line bg-bg aspect-[4/3] relative">
                  <img src={it.src} alt={it.caption} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy-deep/85 to-transparent text-white text-[.74rem] px-3 pt-5 pb-2.5">
                    {it.caption}
                  </div>
                </div>
              ))
            : g.items.map((it) => <MockupCard key={it.src} kind={it.src} />)}
        </div>
      </div>
    </div>,
    document.body
  );
}
