function Experts({ experts }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Expert Profiles</h2>
        <p className="text-slate-600">Search experts by domain and regional knowledge.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {experts.length ? experts.map((expert) => (
          <div key={expert.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="text-sm text-slate-500">{expert.role}</div>
            <h3 className="mt-2 text-xl font-semibold">{expert.name}</h3>
            <p className="mt-3 text-slate-600">Expertise: {expert.expertise.join(', ') || 'General support'}</p>
            <p className="mt-2 text-slate-500 text-sm">Region: {expert.region || 'National'}</p>
          </div>
        )) : (
          <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-sm">No experts available.</div>
        )}
      </div>
    </section>
  );
}

export default Experts;
