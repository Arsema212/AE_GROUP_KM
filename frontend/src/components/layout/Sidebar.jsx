import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../i18n';

const navItems = [
  { key: 'dashboard', path: '/dashboard' },
  { key: 'knowledge', path: '/repository' },
  { key: 'lessons', path: '/lessons' },
  { key: 'experts', path: '/experts' },
  { key: 'discussions', path: '/discussions' },
];

function Sidebar({ language, onLanguageToggle }) {
  const { user } = useAuth();
  const dashboardPath =
    user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'manager' ? '/dashboard/manager' : '/dashboard/staff';

  return (
    <aside className="z-10 w-72 shrink-0 border-r border-slate-200/80 bg-white/85 shadow-soft backdrop-blur-md md:sticky md:top-0 md:h-screen">
      <div className="flex h-full flex-col p-5 md:p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-sm font-bold tracking-tight text-white shadow-glow">
            AE
          </div>
          <div>
            <div className="font-display text-base font-semibold leading-tight tracking-tight text-brand-navy">
              AE Trade Group
            </div>
            <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">KMS</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path === '/dashboard' ? dashboardPath : item.path}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {t(item.key, language)}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {t('users', language)}
            </NavLink>
          )}
        </nav>

        <div className="mt-6 border-t border-slate-200/80 pt-5">
          <button
            type="button"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
            onClick={onLanguageToggle}
          >
            {language === 'en' ? 'አማርኛ' : 'English'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
