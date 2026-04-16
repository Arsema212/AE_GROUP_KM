import { getApiOrigin } from '../services/api';

function KnowledgeCard({ item }) {
  const base = getApiOrigin();
  const fileHref = item.file_path ? `${base}/${item.file_path.replace(/^\//, '')}` : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft transition hover:border-indigo-200/60 hover:shadow-lift">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />
      <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {item.type}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {item.language?.toUpperCase()} · {item.region}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-brand-navy">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{item.content}</p>
      {(item.tags || []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(item.tags || []).map((tag) => (
            <span key={tag} className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
      {fileHref && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-800"
          >
            Attachment
          </a>
        </div>
      )}
      </div>
    </article>
  );
}

export default KnowledgeCard;
