import { t } from '../i18n';

function Discussions({ language }) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">{t('discussions', language)}</h2>
        <p className="mt-2 text-slate-600">A forum-style space for teams to discuss cases and share knowledge.</p>
      </div>
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <p className="text-slate-700">This prototype includes a discussion section placeholder for future enhancement.</p>
        <p className="mt-4 text-slate-600">Next steps: implement threaded comments, post creation, and upvote support for knowledge-driven discussion.</p>
      </div>
    </section>
  );
}

export default Discussions;
