import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Phone, Mail, User as UserIcon } from 'lucide-react';

export default function TeamMemberModal({ member, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

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

        <div className="text-center">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={member.name}
              className="w-[110px] h-[110px] rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div
              className={`w-[110px] h-[110px] rounded-full mx-auto mb-4 flex items-center justify-center font-display font-bold text-white text-3xl ${member.grad}`}
            >
              {member.initials}
            </div>
          )}
          <h3 className="text-xl mb-1">{member.name}</h3>
          <div className="font-mono text-[.72rem] tracking-wide uppercase text-purple font-medium mb-6">
            {member.role}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-start p-3.5 bg-bg border border-line rounded-xl">
            <div className="w-9 h-9 min-w-[36px] rounded-[10px] bg-full-grad text-white flex items-center justify-center">
              <Phone size={15} />
            </div>
            <div>
              <div className="text-[.72rem] text-muted uppercase font-mono">Téléphone</div>
              <div className="text-[.92rem]">{member.phone || 'Non renseigné'}</div>
            </div>
          </div>

          <div className="flex gap-3 items-start p-3.5 bg-bg border border-line rounded-xl">
            <div className="w-9 h-9 min-w-[36px] rounded-[10px] bg-full-grad text-white flex items-center justify-center">
              <Mail size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[.72rem] text-muted uppercase font-mono">Email</div>
              <div className="text-[.92rem] truncate">{member.email || 'Non renseigné'}</div>
            </div>
          </div>

          {member.bio && (
            <div className="flex gap-3 items-start p-3.5 bg-bg border border-line rounded-xl">
              <div className="w-9 h-9 min-w-[36px] rounded-[10px] bg-full-grad text-white flex items-center justify-center">
                <UserIcon size={15} />
              </div>
              <div>
                <div className="text-[.72rem] text-muted uppercase font-mono">À propos</div>
                <p className="text-[.92rem]">{member.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
