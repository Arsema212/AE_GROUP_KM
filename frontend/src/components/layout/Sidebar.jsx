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
    <aside className="w-80 border-r border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 md:sticky md:top-0 md:h-screen">
      <div className="mb-8">
        <div className="text-2xl font-bold text-indigo-700">The AE Trade Group</div>
        <div className="mt-2 text-sm text-slate-600">Knowledge Management System</div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === '/dashboard' ? dashboardPath : item.path}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'
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
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            {t('users', language)}
          </NavLink>
        )}
      </nav>

      <div className="mt-10 rounded-3xl bg-indigo-50 p-4 text-sm text-slate-700">
        <div className="mb-3 font-semibold">{t('language', language)}</div>
        <button
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white hover:bg-indigo-700 transition"
          onClick={onLanguageToggle}
        >
          {language === 'en' ? 'Amharic' : 'English'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
