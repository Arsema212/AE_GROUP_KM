import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth';
import AuthLayout from '../components/auth/AuthLayout';

function Register({ language: _language }) {
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
      setSuccess('Registration complete. Please login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to register');
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">Create account</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-xs font-bold text-white shadow-glow lg:hidden">
          AE
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Full name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-base outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
        >
          Register
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 underline-offset-2 hover:text-indigo-800 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
