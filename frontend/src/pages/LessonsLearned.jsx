import { useEffect, useState } from 'react';
import { fetchLessons, submitLesson } from '../services/api';

function LessonsLearned({ language }) {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ problem: '', solution: '', outcome: '', recommendation: '' });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    async function load() {
      setStatus('loading');
      const data = await fetchLessons();
      setLessons(data || []);
      setStatus('ready');
    }
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('kms_token');
    await submitLesson({ ...form, tags: ['lesson'], language, region: 'national' }, token);
    setForm({ problem: '', solution: '', outcome: '', recommendation: '' });
    const data = await fetchLessons();
    setLessons(data || []);
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Lessons Learned</h2>
        <p className="text-slate-600">Capture tacit knowledge from real SME support cases.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
<form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-semibold">Submit a lesson</h3>
        <label className="mb-3 block text-sm font-medium text-slate-700">Problem</label>
        <textarea
          required
          value={form.problem}
          onChange={(e) => setForm({ ...form, problem: e.target.value })}
          className="mb-4 w-full rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <label className="mb-3 block text-sm font-medium text-slate-700">Solution</label>
        <textarea
          required
          value={form.solution}
          onChange={(e) => setForm({ ...form, solution: e.target.value })}
          className="mb-4 w-full rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <label className="mb-3 block text-sm font-medium text-slate-700">Outcome</label>
        <textarea
          required
          value={form.outcome}
          onChange={(e) => setForm({ ...form, outcome: e.target.value })}
          className="mb-4 w-full rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <label className="mb-3 block text-sm font-medium text-slate-700">Recommendation</label>
        <textarea
          value={form.recommendation}
          onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
          className="mb-4 w-full rounded-xl border border-slate-300 p-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">Submit Lesson</button>
        </form>

        <div className="space-y-4">
          {status === 'loading' ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm">Loading lessons...</div>
          ) : lessons.length ? (
            lessons.map((lesson) => (
              <article key={lesson.id} className="rounded-3xl bg-white p-5 shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-slate-500 text-sm">{lesson.language.toUpperCase()} · {lesson.region}</div>
                <h4 className="mt-2 text-lg font-semibold">Problem</h4>
                <p className="text-slate-700">{lesson.problem}</p>
                <h4 className="mt-3 text-lg font-semibold">Solution</h4>
                <p className="text-slate-700">{lesson.solution}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm">No lessons captured yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LessonsLearned;
