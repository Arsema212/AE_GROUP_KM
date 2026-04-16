import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';

function Topbar({ language, search, setSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md md:px-8 lg:px-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display truncate text-lg font-semibold tracking-tight text-brand-navy md:text-xl">
            {user ? `${user.name}` : 'AE Trade Group'}
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md lg:w-80">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder', language)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-4 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {t('viewProfile', language)}
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700"
            >
              {t('logout', language)}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
