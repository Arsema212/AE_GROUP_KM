import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KnowledgeCard from '../components/KnowledgeCard';
import { fetchKnowledge, submitKnowledge, reviewKnowledge } from '../services/knowledge';

function Repository({ language, query }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.role === 'staff';

  const load = async () => {
    setStatus('loading');
    const data = await fetchKnowledge({ q: query, language });
    setItems(data || []);
    setStatus('ready');
  };

  useEffect(() => {
    load();
  }, [query, language]);

  const pending = useMemo(() => items.filter((i) => i.status === 'review'), [items]);
  const mainList = useMemo(() => {
    if (user?.role === 'manager') return items.filter((i) => i.status !== 'review');
    return items;
  }, [items, user]);

  const handleReview = async (id, action) => {
    await reviewKnowledge(id, action);
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-2xl font-semibold text-transparent">
            Knowledge repository
          </h2>
          <p className="mt-1 text-sm text-slate-500">SOPs, FAQs, and documents — staff submissions need manager approval.</p>
        </div>
        {user ? (
          canCreate ? (
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              New submission
            </button>
          ) : (
            <span className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600">
              {user.role === 'manager' ? 'Approve pending below' : 'View only'}
            </span>
          )
        ) : (
          <button
            type="button"
            className="rounded-2xl border border-indigo-200 bg-white px-6 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        )}
      </div>

      {showCreate && canCreate && (
        <CreateKnowledgeForm onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}

      {user?.role === 'manager' && pending.length > 0 && (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-inner">
          <h3 className="text-lg font-semibold text-amber-950">Pending approval ({pending.length})</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {pending.map((item) => (
              <div key={item.id} className="flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm">
                <KnowledgeCard item={item} />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    onClick={() => handleReview(item.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => handleReview(item.id, 'reject')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'loading' ? (
        <div className="rounded-3xl bg-white/90 p-8 text-center text-slate-600 shadow-sm">Loading…</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mainList.length ? (
            mainList.map((item) => <KnowledgeCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-3xl bg-white/90 p-8 text-slate-600 shadow-sm">No items yet.</div>
          )}
        </div>
      )}
    </section>
  );
}

function CreateKnowledgeForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'document',
    tags: '',
    language: 'en',
    region: 'national',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('type', form.type);
    formData.append('language', form.language);
    formData.append('region', form.region);
    formData.append('tags', JSON.stringify(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)));
    if (file) formData.append('file', file);

    try {
      await submitKnowledge(formData);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">New knowledge item</h3>
        <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-900">
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">Goes to your knowledge manager for approval before it appears for everyone.</p>
      {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="document">Document</option>
          <option value="faq">FAQ</option>
          <option value="sop">SOP</option>
          <option value="training">Training</option>
          <option value="insight">Insight</option>
        </select>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="en">English</option>
          <option value="am">Amharic</option>
        </select>
        <input
          type="text"
          placeholder="Region"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
      <textarea
        placeholder="Content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="mt-4 w-full rounded-2xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        rows="4"
        required
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-medium text-white hover:from-indigo-700 hover:to-violet-700"
        >
          Submit for review
        </button>
        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default Repository;
