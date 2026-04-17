import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { PasswordField } from '../components/auth/PasswordField';

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
    setError('');
    try {
      const user = await login(email, password);
      navigate(getDashboardPath(user?.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to login');
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Sign in"
      title={t('dashboard', language)}
      formSide="right"
    >
      <p className="text-sm text-slate-600">Welcome back — use your AE Trade Group credentials.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Password
          </label>
          <PasswordField
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          Sign in
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-800 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default Login;
