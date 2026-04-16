import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchLessons, reviewLesson, submitLesson } from '../services/knowledge';

function buildLessonParams({ query, status, language, region, tag }) {
  const params = { status };
  if (query?.trim()) params.q = query.trim();
  if (language) params.language = language;
  if (region?.trim()) params.region = region.trim();
  if (tag?.trim()) params.tag = tag.trim();
  return params;
}

function LessonsFilterBar({ region, setRegion, tag, setTag, language, setLanguage }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-soft">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Filters</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="am">Amharic</option>
        </select>
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Region"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag"
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>
    </div>
  );
}

function LessonsLearned({ language, query }) {
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState({ problem: '', solution: '', outcome: '', recommendation: '' });
  const [status, setStatus] = useState('loading');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [managerView, setManagerView] = useState('catalog');
  const { user } = useAuth();

  const isStaff = user?.role === 'staff';
  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  const listStatus = useMemo(() => {
    if (isManager && managerView === 'pending') return 'pending';
    return 'approved';
  }, [isManager, managerView]);

  useEffect(() => {
    async function load() {
      setStatus('loading');
      try {
        const data = await fetchLessons(
          buildLessonParams({
            query,
            status: listStatus,
            language: filterLanguage,
            region: filterRegion,
            tag: filterTag,
          })
        );
        setLessons(data || []);
      } catch {
        setLessons([]);
      }
      setStatus('ready');
    }
    load();
  }, [query, listStatus, filterLanguage, filterRegion, filterTag]);

  const reloadLessons = async () => {
    setStatus('loading');
    try {
      const data = await fetchLessons(
        buildLessonParams({
          query,
          status: listStatus,
          language: filterLanguage,
          region: filterRegion,
          tag: filterTag,
        })
      );
      setLessons(data || []);
    } catch {
      setLessons([]);
    }
    setStatus('ready');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!user || user.role !== 'staff') return;

    await submitLesson({ ...form, tags: ['lesson'], language, region: 'national' });
    setForm({ problem: '', solution: '', outcome: '', recommendation: '' });
    await reloadLessons();
  };

  const handleReview = async (id, action) => {
    await reviewLesson(id, action);
    await reloadLessons();
  };

  const lessonList = (
    <div className="space-y-4">
      {user && (isStaff || isAdmin || isManager) && (
        <LessonsFilterBar
          region={filterRegion}
          setRegion={setFilterRegion}
          tag={filterTag}
          setTag={setFilterTag}
          language={filterLanguage}
          setLanguage={setFilterLanguage}
        />
      )}
      {status === 'loading' ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-sm text-slate-500 shadow-soft">Loading…</div>
      ) : lessons.length ? (
        lessons.map((lesson) => (
          <article
            key={lesson.id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft transition hover:border-indigo-200/50 hover:shadow-lift"
          >
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500/80" />
            <div className="p-5">
            <div className="text-sm text-slate-500">
              {lesson.language?.toUpperCase()} · {lesson.region}
              {lesson.tags?.length > 0 && (
                <span className="ml-2 text-indigo-600">· {lesson.tags.join(', ')}</span>
              )}
            </div>
            <h4 className="mt-2 text-lg font-semibold text-slate-900">Problem</h4>
            <p className="text-slate-700">{lesson.problem}</p>
            <h4 className="mt-4 text-lg font-semibold text-slate-900">Solution</h4>
            <p className="text-slate-700">{lesson.solution}</p>
                {isManager && managerView === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      onClick={() => handleReview(lesson.id, 'approve')}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50"
                      onClick={() => handleReview(lesson.id, 'deny')}
                    >
                      Deny
                    </button>
                  </div>
                )}
            </div>
          </article>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
          No lessons match your filters.
        </div>
      )}
    </div>
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy md:text-2xl">
            Lessons learned
          </h2>
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
                onClick={() => setManagerView('pending')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  managerView === 'pending' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pending
              </button>
            </div>
          )}
        </div>
      </div>

      {isStaff ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft">
            <h3 className="mb-4 font-display text-lg font-semibold text-brand-navy">Submit lesson</h3>
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
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700"
              >
                Submit
              </button>
            </div>
          </form>
          {lessonList}
        </div>
      ) : (
        lessonList
      )}
    </section>
  );
}

export default LessonsLearned;
