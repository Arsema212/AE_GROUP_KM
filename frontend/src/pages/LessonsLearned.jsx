import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLessons, submitLesson } from '../services/knowledge';

function LessonsLearned({ language }) {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ problem: '', solution: '', outcome: '', recommendation: '' });
  const [status, setStatus] = useState('loading');
  const { user } = useAuth();

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
    if (!user) return;

    await submitLesson({ ...form, tags: ['lesson'], language, region: 'national' });
    setForm({ problem: '', solution: '', outcome: '', recommendation: '' });
    const data = await fetchLessons();
    setLessons(data || []);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">Lessons Learned</h2>
        <p className="mt-2 text-slate-600">Capture tacit knowledge from real SME support cases.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold text-slate-900">Submit a lesson</h3>
          <div className="space-y-4">
            <textarea
              required
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              placeholder="Problem"
              className="w-full rounded-2xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <textarea
              required
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              placeholder="Solution"
              className="w-full rounded-2xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <textarea
              required
              value={form.outcome}
              onChange={(e) => setForm({ ...form, outcome: e.target.value })}
              placeholder="Outcome"
              className="w-full rounded-2xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <textarea
              value={form.recommendation}
              onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
              placeholder="Recommendation"
              className="w-full rounded-2xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition">Submit Lesson</button>
          </div>
        </form>

        <div className="space-y-4">
          {status === 'loading' ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm">Loading lessons...</div>
          ) : lessons.length ? (
            lessons.map((lesson) => (
              <article key={lesson.id} className="rounded-3xl bg-white p-5 shadow-lg hover:shadow-xl transition">
                <div className="text-slate-500 text-sm">{lesson.language.toUpperCase()} · {lesson.region}</div>
                <h4 className="mt-2 text-lg font-semibold text-slate-900">Problem</h4>
                <p className="text-slate-700">{lesson.problem}</p>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">Solution</h4>
                <p className="text-slate-700">{lesson.solution}</p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-8 shadow-sm text-slate-600">No lessons captured yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LessonsLearned;
