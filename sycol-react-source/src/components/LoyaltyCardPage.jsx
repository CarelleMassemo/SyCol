import { useEffect, useState } from 'react';
import { Award, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import logo from '../assets/logo.jpeg';
import { useAuth } from '../context/AuthContext';
import { fetchLoyaltyCard, activateLoyaltyCard } from '../lib/api';

export default function LoyaltyCardPage({ code }) {
  const { user, loading: authLoading, login, register } = useAuth();

  const [cardStatus, setCardStatus] = useState(null); // { activated } | null tant que non chargé
  const [cardError, setCardError] = useState('');
  const [activated, setActivated] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState('');

  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchLoyaltyCard(code)
      .then((status) => {
        setCardStatus(status);
        if (status.activated) setMode('login');
      })
      .catch((err) => setCardError(err.message));
  }, [code]);

  // Une fois le client connecté (déjà ou juste après inscription/connexion),
  // on lie automatiquement la carte scannée à son compte.
  useEffect(() => {
    if (!user || !cardStatus || activated || activating) return;
    setActivating(true);
    activateLoyaltyCard(code)
      .then(() => setActivated(true))
      .catch((err) => setActivateError(err.message))
      .finally(() => setActivating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cardStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
        await register({ ...form, name });
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-navy-deep text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 0%, rgba(41,171,226,.22), transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,122,41,.18), transparent 40%)',
        }}
      />

      <div className="relative z-10 bg-white text-navy rounded-[22px] max-w-[420px] w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="Logo SyCol" className="w-[52px] h-[52px] rounded-[13px] object-cover shadow-soft mb-3" />
          <h1 className="text-xl font-display font-bold">Carte de fidélité SyCol</h1>
          <p className="font-mono text-[.72rem] tracking-wide uppercase text-muted mt-1">Carte {code}</p>
        </div>

        {cardError ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <XCircle size={40} className="text-red" />
            <p className="text-[.92rem]">{cardError}</p>
          </div>
        ) : !cardStatus ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 size={28} className="animate-spin text-purple" />
            <p className="text-muted text-sm">Vérification de la carte…</p>
          </div>
        ) : activated ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <CheckCircle2 size={40} className="text-green-600" />
            <h2 className="text-lg font-semibold">Carte activée !</h2>
            <p className="text-[.88rem] text-muted">
              Votre carte de fidélité physique est maintenant liée à votre compte SyCol. Vos points se cumuleront
              automatiquement à chaque achat.
            </p>
            <button onClick={goHome} className="btn-primary justify-center w-full mt-3">
              Aller sur le site
            </button>
          </div>
        ) : activateError ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <XCircle size={40} className="text-red" />
            <p className="text-[.92rem]">{activateError}</p>
          </div>
        ) : authLoading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 size={28} className="animate-spin text-purple" />
          </div>
        ) : user ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 size={28} className="animate-spin text-purple" />
            <p className="text-muted text-sm">Activation de votre carte…</p>
          </div>
        ) : (
          <>
            <div className="flex gap-3 items-start p-3.5 bg-bg border border-dashed border-line rounded-xl mb-6">
              <Award size={18} className="text-purple mt-0.5 shrink-0" />
              <p className="text-[.84rem] text-muted">
                {cardStatus.activated
                  ? 'Cette carte est déjà activée. Connectez-vous avec le compte utilisé lors de son activation.'
                  : "Créez votre compte (ou connectez-vous) pour activer cette carte et commencer à cumuler des points de fidélité et des codes promo."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3.5">
                    <input
                      required
                      type="text"
                      placeholder="Prénom"
                      value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                      className="input-field"
                    />
                    <input
                      required
                      type="text"
                      placeholder="Nom"
                      value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <input
                    required
                    type="tel"
                    placeholder="Téléphone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                  />
                </>
              )}
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input-field"
              />
              <input
                required
                type="password"
                placeholder="Mot de passe"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input-field"
              />

              {formError && <p className="text-red text-[.85rem]">{formError}</p>}

              <button type="submit" disabled={submitting} className="btn-primary justify-center mt-1.5 disabled:opacity-60">
                {submitting ? 'Un instant…' : mode === 'login' ? 'Se connecter et activer' : 'Créer mon compte et activer'}
              </button>
            </form>

            <button
              onClick={() => {
                setMode((m) => (m === 'login' ? 'register' : 'login'));
                setFormError('');
              }}
              className="text-[.85rem] text-muted underline w-full text-center mt-5 hover:text-navy"
            >
              {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
