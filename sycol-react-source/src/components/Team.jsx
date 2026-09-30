import { useEffect, useState } from 'react';
import { fetchTeam } from '../lib/api';
import useReveal from '../hooks/useReveal';
import TeamMemberModal from './TeamMemberModal';

export default function Team() {
  const [headRef, headVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchTeam()
      .then((data) => !cancelled && setTeam(data))
      .catch(() => !cancelled && setTeam([]));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="equipe" className="bg-bg py-28">
      <div className="max-w-[1180px] mx-auto px-6">
        <div
          ref={headRef}
          className={`section-head transition-all duration-700 ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="eyebrow">Qui sommes-nous</span>
          <h2>5 personnes, une seule dynamique</h2>
          <p>L'équipe SyCol, derrière chaque installation, chaque ligne de code et chaque appareil livré.</p>
        </div>

        <div
          ref={gridRef}
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 transition-all duration-700 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {team.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="card text-center px-5 pt-7 pb-6 hover:-translate-y-2 hover:shadow-soft w-full cursor-pointer"
            >
              {m.photo_url ? (
                <img
                  src={m.photo_url}
                  alt={m.name}
                  className="w-[88px] h-[88px] rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <div
                  className={`relative w-[88px] h-[88px] rounded-full mx-auto mb-4 flex items-center justify-center font-display font-bold text-white text-xl ${m.grad}`}
                >
                  {m.initials}
                  <span className="absolute -inset-1 rounded-full border-2 border-dashed border-purple/35" />
                </div>
              )}
              <h4 className="text-[1.02rem] mb-1">{m.name}</h4>
              <div className="font-mono text-[.68rem] tracking-wide uppercase text-purple font-medium mb-2.5 min-h-[28px]">
                {m.role}
              </div>
              {!m.photo_url && (
                <span className="text-[.7rem] text-muted bg-white border border-dashed border-line rounded-lg px-2 py-1 inline-block">
                  📷 Photo à ajouter
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {selected && <TeamMemberModal member={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
