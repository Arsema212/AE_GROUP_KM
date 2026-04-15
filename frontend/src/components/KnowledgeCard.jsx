function KnowledgeCard({ item }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          {item.type}
        </span>
        <span className="text-xs text-slate-500">{item.language.toUpperCase()} · {item.region}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-3 text-slate-600 line-clamp-3">{item.content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(item.tags || []).map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {tag}
          </span>
        ))}
      </div>
      {item.file_path && (
        <div className="mt-4">
          <a
            href={`http://localhost:4000/${item.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Download Attachment
          </a>
        </div>
      )}
    </article>
  );
}

export default KnowledgeCard;
