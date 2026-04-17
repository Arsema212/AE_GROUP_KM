import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const roleHighlights = {
  admin: [
    { title: 'Platform governance', text: 'Manage users, assign roles, and keep access policies aligned.' },
    { title: 'Quality oversight', text: 'Review knowledge quality and prioritize updates for critical content.' },
    { title: 'System visibility', text: 'Track usage and ensure taxonomy consistency across regions.' },
  ],
  manager: [
    { title: 'Team contribution', text: 'Monitor team knowledge submissions and close content gaps quickly.' },
    { title: 'Regional alignment', text: 'Coordinate language and region-specific updates with experts.' },
    { title: 'Mentorship', text: 'Guide staff on lesson capture and reusable process documentation.' },
  ],
  staff: [
    { title: 'Knowledge access', text: 'Find SOPs, FAQs, and reference assets for day-to-day tasks.' },
    { title: 'Lessons learned', text: 'Capture outcomes from support cases to improve future delivery.' },
    { title: 'Expert discovery', text: 'Connect with advisors by expertise and region for quick support.' },
  ],
};

function Dashboard({ language, role }) {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'staff';
  const cards = roleHighlights[activeRole] || roleHighlights.staff;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{t('dashboard', language)}</h2>
            <p className="mt-2 text-slate-600">{t('overview', language)}</p>
          </div>
          <div className="rounded-3xl bg-indigo-50 px-5 py-4 text-slate-700">
            <div className="text-sm text-slate-500">{t('role', language)}</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{user?.role}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{activeRole}</div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-slate-600">{card.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
