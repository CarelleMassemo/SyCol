import { memo, useState } from 'react';
import { Star, Send } from 'lucide-react';
import useReviews from '../hooks/useReviews';
import useReveal from '../hooks/useReveal';
import { useApp } from '../context/AppContext';

const SERVICE_OPTIONS = [
  'Électroménager',
  'Accessoires',
  'Installation caméras',
  'Développement web / mobile',
  'Électricité',
  'Autre',
];

function renderStars(value) {
  return '★★★★★☆☆☆☆☆'.slice(5 - Math.round(value), 10 - Math.round(value));
}

const ReviewItem = memo(function ReviewItem({ r }) {
  return (
    <div className="bg-bg border border-line rounded-2xl p-5">
      <div className="flex justify-between items-start gap-2.5 mb-2">
        <div>
          <div className="font-bold text-[.95rem]">{r.name}</div>
          <div className="font-mono text-[.68rem] text-muted uppercase">{r.service}</div>
        </div>
        <div className="text-[.72rem] text-muted whitespace-nowrap">
          {new Date(r.ts).toLocaleDateString('fr-FR')}
        </div>
      </div>
      <div className="text-[#F5A623] text-base tracking-[2px]">{renderStars(r.stars)}</div>
      <p className="text-[.9rem] mt-1.5">{r.comment}</p>
    </div>
  );
});

export default function Reviews() {
  const { reviews, addReview, average } = useReviews();
  const { showToast } = useApp();
  const [ref, visible] = useReveal();
  const [form, setForm] = useState({ name: '', service: '', comment: '', stars: 0 });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.stars === 0) {
      showToast('Merci de sélectionner une note ⭐');
      return;
    }
    setSubmitting(true);
    try {
      await addReview(form);
      showToast('Merci pour votre avis ! 🎉');
      setForm({ name: '', service: '', comment: '', stars: 0 });
    } catch {
      showToast("Erreur : impossible d'enregistrer votre avis, réessayez ✗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="avis" className="bg-white py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div className="section-head">
          <span className="eyebrow">La parole à nos clients</span>
          <h2>Avis clients</h2>
          <p>
            Vous avez reçu un produit ou une prestation ? Partagez votre expérience, elle est visible sur cette
            page.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-12 items-start transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="bg-bg rounded-xl2 p-8 border border-line md:sticky md:top-[100px]">
            <div className="font-display font-bold text-[3.2rem] leading-none bg-full-grad bg-clip-text text-transparent">
              {reviews.length ? average.toFixed(1) : '—'}
            </div>
            <div className="text-[#F5A623] text-base tracking-[2px]">{renderStars(average)}</div>
            <p className="text-[.85rem] text-muted mt-2">
              {reviews.length ? `${reviews.length} avis client${reviews.length > 1 ? 's' : ''}` : 'Aucun avis pour le moment'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-6">
              <input
                type="text"
                required
                placeholder="Votre nom"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-purple outline-none text-[.92rem]"
              />
              <select
                required
                value={form.service}
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-purple outline-none text-[.92rem] bg-white"
              >
                <option value="" disabled>
                  Produit ou service concerné
                </option>
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <div className="flex gap-1.5 text-2xl">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setForm((f) => ({ ...f, stars: v }))}
                    aria-label={`${v} étoile${v > 1 ? 's' : ''}`}
                    className="leading-none"
                  >
                    <Star
                      size={26}
                      className={v <= form.stars ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#D8DCE8]'}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={3}
                placeholder="Votre avis..."
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-line focus:border-purple outline-none text-[.92rem] resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary justify-center disabled:opacity-60">
                <Send size={16} /> {submitting ? 'Envoi…' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-4 max-h-[640px] overflow-y-auto pr-1.5">
            {reviews.length === 0 ? (
              <div className="text-center py-10 px-5 text-muted text-[.92rem]">
                Aucun avis pour le moment. Soyez le premier à partager votre expérience !
              </div>
            ) : (
              reviews.map((r) => <ReviewItem key={r.id} r={r} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
