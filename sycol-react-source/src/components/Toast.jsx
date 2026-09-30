import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3.5 rounded-full text-[.88rem] font-semibold flex items-center gap-2.5 shadow-[0_16px_34px_-10px_rgba(0,0,0,.4)] z-[999] transition-transform duration-300 ${
        toast.show ? 'translate-y-0' : 'translate-y-[140%]'
      }`}
    >
      <CheckCircle2 size={18} className="text-[#5AD98A]" />
      <span>{toast.text}</span>
    </div>
  );
}
