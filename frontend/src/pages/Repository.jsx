import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KnowledgeCard from '../components/KnowledgeCard';
import { fetchKnowledge, reviewKnowledge, submitKnowledge } from '../services/knowledge';

function buildKnowledgeParams({ query, status, type, region, tag, language }) {
  const params = { status };
  if (query?.trim()) params.q = query.trim();
  if (type) params.type = type;
  if (region?.trim()) params.region = region.trim();
  if (tag?.trim()) params.tag = tag.trim();
  if (language) params.language = language;
  return params;
}

function FilterBar({ type, setType, region, setRegion, tag, setTag, language, setLanguage, disabled }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft ${disabled ? 'opacity-60' : ''}`}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={disabled}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All types</option>
          <option value="document">Document</option>
          <option value="faq">FAQ</option>
          <option value="sop">SOP</option>
          <option value="training">Training</option>
          <option value="insight">Insight</option>
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={disabled}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="am">Amharic</option>
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          disabled={disabled}
          placeholder="Region"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          disabled={disabled}
          placeholder="Tag"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );
}

function Repository({ language: _pageLanguage, query }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showCreate, setShowCreate] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [managerView, setManagerView] = useState('catalog');
  const { user } = useAuth();
  const navigate = useNavigate();

  const listStatus = useMemo(() => {
    if (user?.role === 'manager' && managerView === 'review') return 'review';
    return 'published';
  }, [user?.role, managerView]);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const data = await fetchKnowledge(
          buildKnowledgeParams({
            query,
            status: listStatus,
            type: filterType,
            region: filterRegion,
            tag: filterTag,
            language: filterLanguage,
          })
        );
        setItems(data || []);
      } catch {
        setItems([]);
      }
      setStatus('ready');
    }
    load();
  }, [query, listStatus, filterType, filterRegion, filterTag, filterLanguage]);

  const handleCreateSuccess = async () => {
    setShowCreate(false);
    setStatus('loading');
    try {
      const data = await fetchKnowledge(
        buildKnowledgeParams({
          query,
          status: listStatus,
          type: filterType,
          region: filterRegion,
          tag: filterTag,
          language: filterLanguage,
        })
      );
      setItems(data || []);
    } catch {
      setItems([]);
    }
    setStatus('ready');
  };

  const handleReview = async (id, action) => {
    await reviewKnowledge(id, action);
    await handleCreateSuccess();
  };

  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <section className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy md:text-2xl">
            Knowledge repository
          </h2>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {isManager && (
            <div className="flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
              <button
                type="button"
                onClick={() => setManagerView('catalog')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  managerView === 'catalog' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-600'
                }`}
              >
                Catalog
              </button>
              <button
                type="button"
                onClick={() => setManagerView('review')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  managerView === 'review' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pending
              </button>
            </div>
          )}
          {isStaff ? (
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
              onClick={() => setShowCreate(!showCreate)}
            >
              Submit item
            </button>
          ) : !user ? (
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          ) : null}
        </div>
      </div>

      {user && (isAdmin || isStaff || isManager) && (
        <FilterBar
          type={filterType}
          setType={setFilterType}
          region={filterRegion}
          setRegion={setFilterRegion}
          tag={filterTag}
          setTag={setFilterTag}
          language={filterLanguage}
          setLanguage={setFilterLanguage}
          disabled={false}
        />
      )}

      {showCreate && isStaff && <CreateKnowledgeForm onClose={() => setShowCreate(false)} onCreated={handleCreateSuccess} />}

      {status === 'loading' ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center text-sm text-slate-500 shadow-soft">
          Loading…
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="space-y-3">
                <KnowledgeCard item={item} />
                {isManager && managerView === 'review' && (
                  <div className="flex gap-2 rounded-xl border border-slate-100 bg-white p-2 shadow-soft">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      onClick={() => handleReview(item.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
                      onClick={() => handleReview(item.id, 'deny')}
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No items match your filters.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function CreateKnowledgeForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', type: 'document', tags: '', language: 'en', region: 'national' });
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
    formData.append('status', 'published');
    formData.append('tags', JSON.stringify(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)));
    if (file) formData.append('file', file);

    try {
      await submitKnowledge(formData);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create knowledge item.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-brand-navy">New knowledge item</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">
          Close
        </button>
      </div>
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
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
        >
          Create
        </button>
        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 px-5 py-3 transition hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default Repository;
