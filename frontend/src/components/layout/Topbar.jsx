import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';

function Topbar({ language, search, setSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{t('dashboard', language)}</div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {user ? `${t('welcome', language)} ${user.name}` : 'AE Trade Group KMS'}
          </h1>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-[420px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder', language)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {t('viewProfile', language)}
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              {t('logout', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
