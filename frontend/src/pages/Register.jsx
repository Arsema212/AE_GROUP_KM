import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { PasswordField } from '../components/auth/PasswordField';

function Register({ language }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register({ name, email, password, role });
      setSuccess('Registration complete. Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to register');
    }
  };

  return (
    <AuthSplitLayout eyebrow="Join" title="Create your account" formSide="right">
      <p className="text-sm text-slate-600">Set up access to the knowledge workspace.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="reg-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Email
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Password
          </label>
          <PasswordField
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-role" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Role
          </label>
          <select
            id="reg-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          Create account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-800 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default Register;
