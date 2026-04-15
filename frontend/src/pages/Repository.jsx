import { useEffect, useState } from 'react';
import KnowledgeCard from '../components/KnowledgeCard';
import { fetchKnowledge } from '../services/api';

function Repository({ language, query }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      const data = await fetchKnowledge({ q: query, language });
      setItems(data || []);
      setStatus('ready');
    }
    load();
  }, [query, language]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Knowledge Repository</h2>
          <p className="text-slate-600">Browse SOPs, FAQs, documents and regional knowledge assets.</p>
        </div>
        <button
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          onClick={() => setShowCreate(!showCreate)}
        >
          Create Knowledge Item
        </button>
      </div>

      {showCreate && <CreateKnowledgeForm onClose={() => setShowCreate(false)} onCreated={() => window.location.reload()} />}

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('kms_token'); // Assuming token is stored
    if (!token) {
      alert('Please login first');
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) formData.append('file', file);

    try {
      const response = await fetch('http://localhost:4000/api/knowledge', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        onCreated();
      } else {
        alert('Error creating knowledge item');
      }
    } catch (err) {
      console.error(err);
      alert('Error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-semibold">Create New Knowledge Item</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
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
          onChange={(e) => setForm({ ...form, tags: e.target.value.split(',') })}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <select
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value })}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        >
          <option value="en">English</option>
          <option value="am">Amharic</option>
        </select>
        <input
          type="text"
          placeholder="Region"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
      </div>
      <textarea
        placeholder="Content"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        className="mt-4 w-full rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        rows="4"
        required
      />
      <div className="mt-4 flex gap-3">
        <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">Create</button>
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50 transition-all">Cancel</button>
      </div>
    </form>
  );
}

export default Repository;
