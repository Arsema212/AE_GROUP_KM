import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const roleHighlights = {
  admin: [
    { title: 'Users & access', text: 'Roles, profiles, and governance.' },
    { title: 'Oversight', text: 'Quality and taxonomy alignment.' },
    { title: 'Visibility', text: 'Cross-region consistency.' },
  ],
  manager: [
    { title: 'Approvals', text: 'Review knowledge and lessons.' },
    { title: 'Alignment', text: 'Regional and language coverage.' },
    { title: 'Mentorship', text: 'Guide team contributions.' },
  ],
  staff: [
    { title: 'Repository', text: 'SOPs, FAQs, documents.' },
    { title: 'Lessons', text: 'Capture outcomes from cases.' },
    { title: 'Experts', text: 'Find help by expertise.' },
  ],
};

function Dashboard({ language, role }) {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'staff';
  const cards = roleHighlights[activeRole] || roleHighlights.staff;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 p-6 shadow-xl">
        <div className="h-1 w-32 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500" />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t('dashboard', language)}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('overview', language)}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-4 text-white shadow-lg shadow-indigo-500/30">
            <div className="text-xs uppercase tracking-wider text-indigo-100">{t('role', language)}</div>
            <div className="mt-1 text-lg font-semibold capitalize">{user?.role}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md transition hover:shadow-lg"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-90" />
            <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{activeRole}</div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
