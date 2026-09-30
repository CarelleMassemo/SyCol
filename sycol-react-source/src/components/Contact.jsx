import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useReveal from '../hooks/useReveal';
import { postContact } from '../lib/api';

const INFO = [
  { icon: MapPin, title: 'Adresse', text: "Ndokoti — Douala, Cameroun" },
  { icon: Phone, title: 'Téléphone / WhatsApp', text: '+33 0664042690' },
  { icon: Mail, title: 'Email', text: 'sycolsynergiecollective@gmail.com' },
  { icon: Clock, title: 'Horaires', text: 'Lundi – Samedi, 9h – 19h' },
];

export default function Contact() {
  const { contactMessage, setContactMessage, showToast } = useApp();
  const [ref, visible] = useReveal();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      message: data.get('message'),
    };

    setSubmitting(true);
    try {
      await postContact(payload);
      showToast('Message envoyé — nous vous répondrons rapidement ✓');
      setContactMessage('');
      form.reset();
    } catch {
      showToast("Erreur : impossible d'envoyer votre message, réessayez ✗");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-bg py-28">
      <div
        ref={ref}
        className={`max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-12 transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div>
          <span className="eyebrow">Restons en contact</span>
          <h2 className="text-[clamp(1.8rem,3.2vw,2.4rem)] my-3.5 mb-6">Parlons de votre projet</h2>
          <div className="flex flex-col gap-4">
            {INFO.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 items-start p-4 bg-white border border-line rounded-2xl">
                <div className="w-10 h-10 min-w-[40px] rounded-[11px] bg-full-grad text-white flex items-center justify-center">
                  <Icon size={17} />
                </div>
                <div>
                  <h4 className="text-[.92rem] mb-0.5">{title}</h4>
                  <p className="text-[.85rem] text-muted m-0">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl2 p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <input required name="name" type="text" placeholder="Nom complet" className="input-field" />
              <input required name="phone" type="tel" placeholder="Téléphone" className="input-field" />
            </div>
            <input required name="email" type="email" placeholder="Email" className="input-field mt-3.5 w-full" />
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Votre message..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="input-field mt-3.5 w-full resize-none"
            />
            <button type="submit" disabled={submitting} className="btn-primary justify-center w-full mt-4 disabled:opacity-60">
              <Send size={16} /> {submitting ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
