import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLessons, submitLesson, reviewLesson } from '../services/knowledge';

const statusStyle = {
  published: 'bg-emerald-100 text-emerald-900',
  review: 'bg-amber-100 text-amber-950',
  rejected: 'bg-slate-200 text-slate-800',
  draft: 'bg-slate-100 text-slate-700',
};

function LessonsLearned({ language }) {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ problem: '', solution: '', outcome: '', recommendation: '' });
  const [status, setStatus] = useState('loading');
  const { user } = useAuth();

  const load = async () => {
    setStatus('loading');
    const data = await fetchLessons();
    setLessons(data || []);
    setStatus('ready');
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(() => lessons.filter((l) => (l.status || 'published') === 'review'), [lessons]);
  const mainList = useMemo(() => {
    if (user?.role === 'manager') return lessons.filter((l) => (l.status || 'published') !== 'review');
    return lessons;
  }, [lessons, user]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user || user.role !== 'staff') return;
    await submitLesson({ ...form, tags: ['lesson'], language, region: 'national' });
    setForm({ problem: '', solution: '', outcome: '', recommendation: '' });
    await load();
  };

  const handleReview = async (id, action) => {
    await reviewLesson(id, action);
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/40 p-6 shadow-lg">
        <h2 className="bg-gradient-to-r from-slate-900 to-violet-900 bg-clip-text text-2xl font-semibold text-transparent">
          Lessons learned
        </h2>
        <p className="mt-1 text-sm text-slate-500">Staff submit; managers approve before org-wide visibility.</p>
      </div>

      {user?.role === 'staff' && (
        <form onSubmit={onSubmit} className="max-w-3xl rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900">Submit a lesson</h3>
          <div className="mt-4 space-y-4">
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
              placeholder="Recommendation (optional)"
              className="w-full rounded-2xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-medium text-white shadow-md hover:from-indigo-700 hover:to-violet-700"
            >
              Submit for review
            </button>
          </div>
        </form>
      )}

      {user?.role === 'manager' && pending.length > 0 && (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <h3 className="text-lg font-semibold text-amber-950">Pending ({pending.length})</h3>
          <div className="mt-4 space-y-4">
            {pending.map((lesson) => (
              <div key={lesson.id} className="rounded-2xl bg-white/95 p-4 shadow-sm">
                <p className="text-xs text-slate-500">
                  {lesson.language?.toUpperCase()} · {lesson.region}
                </p>
                <p className="mt-2 font-medium text-slate-900">{lesson.problem}</p>
                <p className="mt-1 text-sm text-slate-700 line-clamp-3">{lesson.solution}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    onClick={() => handleReview(lesson.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => handleReview(lesson.id, 'reject')}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {status === 'loading' ? (
          <div className="rounded-3xl bg-white/90 p-8 shadow-sm">Loading…</div>
        ) : mainList.length ? (
          mainList.map((lesson) => (
            <article
              key={lesson.id}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md transition hover:shadow-lg"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-400" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  {lesson.language?.toUpperCase()} · {lesson.region}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${statusStyle[lesson.status] || statusStyle.published}`}
                >
                  {(lesson.status || 'published') === 'published'
                    ? 'Live'
                    : lesson.status === 'review'
                      ? 'Pending'
                      : lesson.status === 'rejected'
                        ? 'Declined'
                        : lesson.status || 'Live'}
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-slate-900">Problem</h4>
              <p className="mt-1 text-slate-700">{lesson.problem}</p>
              <h4 className="mt-4 text-base font-semibold text-slate-900">Solution</h4>
              <p className="mt-1 text-slate-700">{lesson.solution}</p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-white/90 p-8 text-slate-600 shadow-sm">No lessons yet.</div>
        )}
      </div>
    </section>
  );
}

export default LessonsLearned;
