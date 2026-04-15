import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Repository', path: '/repository' },
  { label: 'Lessons Learned', path: '/lessons' },
  { label: 'Experts', path: '/experts' },
  { label: 'Discussions', path: '/discussions' },
];

function Sidebar({ language, onLanguageToggle }) {
  return (
    <aside className="w-72 h-screen border-r border-slate-200 bg-gradient-to-b from-indigo-50 to-white p-6 flex flex-col">
      <div className="mb-8">
        <div className="text-2xl font-bold text-indigo-700">AE Trade Group</div>
        <div className="mt-2 text-sm text-slate-600">Knowledge Management System</div>
        <div className="mt-1 text-xs text-slate-500">Localized trade knowledge for SMEs</div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-slate-100 hover:shadow-md'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 p-4 text-sm text-slate-700">
        <div className="mb-3 font-semibold">Language</div>
        <button
          className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
          onClick={onLanguageToggle}
        >
          {language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
