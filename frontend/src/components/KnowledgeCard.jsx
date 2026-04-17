import { getApiOrigin } from '../services/api';

const statusLabel = {
  published: 'Live',
  review: 'Pending',
  rejected: 'Declined',
  draft: 'Draft',
};

function KnowledgeCard({ item }) {
  const origin = getApiOrigin();
  const fileName = item.file_path ? item.file_path.split(/[/\\]/).pop() : '';
  const fileHref = item.file_path ? `${origin}/uploads/${encodeURIComponent(fileName)}` : null;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 p-6 shadow-md transition hover:shadow-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 opacity-90" />
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          {item.type}
        </span>
        <div className="flex items-center gap-2">
          {item.status && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.status === 'review'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              {statusLabel[item.status] || item.status}
            </span>
          )}
          <span className="text-xs text-slate-500">
            {item.language?.toUpperCase()} · {item.region}
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-3 line-clamp-3 text-slate-600">{item.content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(item.tags || []).map((tag) => (
          <span key={tag} className="rounded-full bg-white/80 px-2 py-px text-xs text-slate-600 ring-1 ring-slate-200/80">
            {tag}
          </span>
        ))}
      </div>
      {fileHref && (
        <div className="mt-4">
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Attachment
          </a>
        </div>
      )}
    </article>
  );
}

export default KnowledgeCard;
