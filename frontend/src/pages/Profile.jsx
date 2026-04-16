import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, fetchMe } from '../services/auth';
import { t } from '../i18n';

function Profile({ language }) {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', expertise: '', region: '', language_preference: 'en' });
  const [message, setMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        expertise: (user.expertise || []).join(', '),
        region: user.region || '',
        language_preference: user.language_preference || 'en',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const expertise = form.expertise.split(',').map((item) => item.trim()).filter(Boolean);
    const updated = await updateProfile({ ...form, expertise }, token);
    updateUser(updated.user);
    setMessage('Profile updated successfully.');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    const updated = await changePassword(passwordForm, token);
    updateUser(updated.user);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setMessage('Password updated successfully.');
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy md:text-2xl">{t('profile', language)}</h2>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-brand-navy">{t('updateProfile', language)}</h3>
          {message && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-slate-700">{message}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('name', language)}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('expertise', language)}</label>
              <input
                type="text"
                value={form.expertise}
                onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                placeholder="Customer onboarding, compliance"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('region', language)}</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('languagePreference', language)}</label>
              <select
                value={form.language_preference}
                onChange={(e) => setForm({ ...form, language_preference: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
            >
              {t('saveChanges', language)}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft">
          <h3 className="mb-4 font-display text-lg font-semibold text-brand-navy">{t('changePassword', language)}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('currentPassword', language)}</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('newPassword', language)}</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('confirmPassword', language)}</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {t('saveChanges', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
