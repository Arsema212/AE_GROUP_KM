import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import AuthLayout from '../components/auth/AuthLayout';

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
    <AuthLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">{t('signIn', language)}</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-xs font-bold text-white shadow-glow lg:hidden">
          AE
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        New to the platform?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-800 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
