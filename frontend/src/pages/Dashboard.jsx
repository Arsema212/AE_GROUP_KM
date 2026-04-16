import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

const roleFocus = {
  admin: ['User access', 'Oversight', 'Taxonomy'],
  manager: ['Approvals', 'Regional alignment', 'Coaching'],
  staff: ['Repository', 'Lessons', 'Experts'],
};

function Dashboard({ language, role }) {
  const { user } = useAuth();
  const activeRole = role || user?.role || 'staff';
  const labels = roleFocus[activeRole] || roleFocus.staff;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy">
            {t('dashboard', language)}
          </h2>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('role', language)}</span>
            <span className="text-sm font-semibold capitalize text-slate-900">{user?.role}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {labels.map((label) => (
          <div
            key={label}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-soft"
          >
            <div className="h-0.5 bg-gradient-to-r from-indigo-400 to-violet-500" />
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-slate-800">{label}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
