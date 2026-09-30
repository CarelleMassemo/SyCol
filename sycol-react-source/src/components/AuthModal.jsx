import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const { showToast } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '' });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        showToast('Connexion réussie ✓');
      } else {
        const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
        await register({ ...form, name });
        showToast('Compte créé — bienvenue chez SyCol ✓');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-navy-deep/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[22px] max-w-[420px] w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative animate-fadeUp">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-5 right-5 w-[38px] h-[38px] rounded-full bg-bg border border-line flex items-center justify-center hover:bg-navy hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-full-grad text-white flex items-center justify-center mb-4">
          <User size={20} />
        </div>
        <h3 className="text-2xl mb-1">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h3>
        <p className="text-muted text-[.88rem] mb-6">
          {mode === 'login'
            ? 'Retrouvez vos commandes et vos avantages fidélité.'
            : 'Suivez vos commandes et débloquez des codes promo au fil de vos achats.'}
        </p>

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

          {error && <p className="text-red text-[.85rem]">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary justify-center mt-1.5 disabled:opacity-60">
            {submitting ? 'Un instant…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'login' ? 'register' : 'login'));
            setError('');
          }}
          className="text-[.85rem] text-muted underline w-full text-center mt-5 hover:text-navy"
        >
          {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>,
    document.body
  );
}
