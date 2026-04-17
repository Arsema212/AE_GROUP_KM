import { useEffect, useState } from 'react';
import { fetchExperts } from '../services/knowledge';

function Experts({ language }) {
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
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">Expert Profiles</h2>
        <p className="mt-2 text-slate-600">Search experts by domain and regional knowledge.</p>
      </div>

      {status === 'loading' ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm">Loading experts...</div>
      ) : experts.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {experts.map((expert) => (
            <div key={expert.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg hover:shadow-xl transition">
              <div className="text-sm text-slate-500">{expert.role}</div>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{expert.name}</h3>
              <p className="mt-3 text-slate-600">Expertise: {(expert.expertise || []).join(', ') || 'General support'}</p>
              <p className="mt-2 text-slate-500 text-sm">Region: {expert.region || 'National'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm text-slate-600">No experts available.</div>
      )}
    </section>
  );
}

export default Experts;
