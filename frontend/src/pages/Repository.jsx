import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import KnowledgeCard from '../components/KnowledgeCard';
import { fetchKnowledge, submitKnowledge } from '../services/knowledge';

function Repository({ language, query }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setStatus('loading');
      const data = await fetchKnowledge({ q: query, language });
      setItems(data || []);
      setStatus('ready');
    }
    load();
  }, [query, language]);

  const handleCreateSuccess = async () => {
    setShowCreate(false);
    setStatus('loading');
    const data = await fetchKnowledge({ q: query, language });
    setItems(data || []);
    setStatus('ready');
  };

  return (
    <section className="space-y-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Knowledge Repository</h2>
          <p className="text-slate-600">Browse SOPs, FAQs, documents, and regional knowledge assets.</p>
        </div>
        {user ? (
          <button
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            onClick={() => setShowCreate(!showCreate)}
          >
            Create Knowledge Item
          </button>
        ) : (
          <button
            className="rounded-2xl border border-indigo-300 bg-white px-6 py-3 text-indigo-700 hover:bg-indigo-50 transition-all"
            onClick={() => navigate('/login')}
          >
            Sign in to contribute
          </button>
        )}
      </div>

      {showCreate && <CreateKnowledgeForm onClose={() => setShowCreate(false)} onCreated={handleCreateSuccess} />}

      {status === 'loading' ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm">Loading repository...</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.length ? items.map((item) => <KnowledgeCard key={item.id} item={item} />) : (
            <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-sm">No knowledge items found.</div>
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
    <form onSubmit={handleSubmit} className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">Create New Knowledge Item</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-900">
          Close
        </button>
      </div>
      {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
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
        <button type="submit" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition">Create</button>
        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-300 px-5 py-3 hover:bg-slate-50 transition">Cancel</button>
      </div>
    </form>
  );
}

export default Repository;
