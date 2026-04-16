import { useEffect, useState } from 'react';
import { fetchExperts } from '../services/knowledge';

function Experts() {
  const [experts, setExperts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function load() {
      setStatus('loading');
      const data = await fetchExperts();
      setExperts(data || []);
      setStatus('ready');
    }
    load();
  }, []);

  return (
    <section className="space-y-5">
      <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy md:text-2xl">Experts</h2>

      {status === 'loading' ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-sm text-slate-500 shadow-soft">Loading…</div>
      ) : experts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft transition hover:border-indigo-200/50 hover:shadow-lift"
            >
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500/80" />
              <div className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{expert.role}</div>
              <h3 className="mt-2 font-display text-lg font-semibold text-brand-navy">{expert.name}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(expert.expertise || []).length ? (
                  expert.expertise.map((area) => (
                    <span key={area} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {area}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">—</span>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">{expert.region || 'National'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
          No experts listed.
        </div>
      )}
    </section>
  );
}

export default Experts;
