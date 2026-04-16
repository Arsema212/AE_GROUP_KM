import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

function getDashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'manager') return '/dashboard/manager';
  return '/dashboard/staff';
}

function Login({ language }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(getDashboardPath(user?.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-200/80 bg-white p-8 shadow-lift">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 text-xs font-bold text-white shadow-glow">
            AE
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-brand-navy">AE Trade Group</div>
            <div className="text-xs text-slate-500">KMS</div>
          </div>
        </div>
        <h2 className="font-display text-lg font-semibold text-slate-900">{t('signIn', language)}</h2>

        {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
