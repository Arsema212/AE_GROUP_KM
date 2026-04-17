import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiOrigin } from '../services/api';
import {
  fetchDiscussionPosts,
  fetchDiscussionPost,
  createDiscussionPost,
  addComment,
  setReaction,
  clearReaction,
  deleteDiscussionPost,
} from '../services/discussions';
import { t } from '../i18n';

const REACTIONS = [
  { type: 'like', label: '👍' },
  { type: 'love', label: '❤️' },
  { type: 'laugh', label: '😄' },
  { type: 'insight', label: '💡' },
  { type: 'celebrate', label: '🎉' },
];

function Discussions({ language }) {
  const { user } = useAuth();
  const origin = getApiOrigin();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [composer, setComposer] = useState({ open: false, mode: 'article', title: '', body: '', file: null });
  const [expanded, setExpanded] = useState(null);
  const [thread, setThread] = useState(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (from = 0) => {
    setLoading(true);
    try {
      const { posts: next, has_more } = await fetchDiscussionPosts({ offset: from, limit: 15 });
      if (from === 0) setPosts(next || []);
      else setPosts((prev) => [...prev, ...(next || [])]);
      setHasMore(!!has_more);
      setOffset(from + (next?.length || 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const openThread = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      setThread(null);
      return;
    }
    setExpanded(id);
    setThreadLoading(true);
    setThread(null);
    try {
      const data = await fetchDiscussionPost(id);
      setThread(data);
    } finally {
      setThreadLoading(false);
    }
  };

  const onReact = async (postId, type, current) => {
    try {
      if (current === type) {
        const { my_reaction, reaction_counts } = await clearReaction(postId);
        patchPost(postId, { my_reaction, reaction_counts });
      } else {
        const { my_reaction, reaction_counts } = await setReaction(postId, type);
        patchPost(postId, { my_reaction, reaction_counts });
      }
      if (thread?.post?.id === postId) {
        setThread((prev) =>
          prev
            ? {
                ...prev,
                post: {
                  ...prev.post,
                  my_reaction,
                  reaction_counts,
                },
              }
            : prev
        );
      }
    } catch {
      /* ignore */
    }
  };

  const patchPost = (id, partial) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  };

  const sendComment = async (postId) => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, { content: commentText.trim() });
      setCommentText('');
      const data = await fetchDiscussionPost(postId);
      setThread(data);
      patchPost(postId, { comment_count: data.post.comment_count });
    } finally {
      setSubmitting(false);
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (composer.mode === 'meme' && !composer.file) {
      return;
    }
    const fd = new FormData();
    fd.append('post_type', composer.mode);
    fd.append('title', composer.title);
    fd.append('body', composer.body);
    if (composer.mode === 'meme' && composer.file) fd.append('image', composer.file);
    if (composer.mode === 'article' && composer.file) fd.append('image', composer.file);
    setSubmitting(true);
    try {
      await createDiscussionPost(fd);
      setComposer({ open: false, mode: 'article', title: '', body: '', file: null });
      await load(0);
    } finally {
      setSubmitting(false);
    }
  };

  const imgUrl = (pathOrUrl) => {
    if (!pathOrUrl) return null;
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    return `${origin}${pathOrUrl}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-2xl font-semibold text-transparent">
            {t('discussions', language)}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Articles, memes, reactions, and threads.</p>
        </div>
        {user && (
          <button
            type="button"
            onClick={() => setComposer((c) => ({ ...c, open: !c.open }))}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20"
          >
            {composer.open ? 'Close' : 'New post'}
          </button>
        )}
      </div>

      {composer.open && user && (
        <form
          onSubmit={submitPost}
          className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-xl"
        >
          <div className="flex gap-2">
            {['article', 'meme'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setComposer((c) => ({ ...c, mode: m }))}
                className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
                  composer.mode === m
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/80 text-slate-600 ring-1 ring-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {composer.mode === 'article' && (
            <input
              className="mt-4 w-full rounded-2xl border border-slate-300 p-3"
              placeholder="Title"
              value={composer.title}
              onChange={(e) => setComposer((c) => ({ ...c, title: e.target.value }))}
              required
            />
          )}
          <textarea
            className="mt-3 w-full rounded-2xl border border-slate-300 p-3"
            placeholder={composer.mode === 'meme' ? 'Caption (optional)' : 'Write something…'}
            rows={4}
            value={composer.body}
            onChange={(e) => setComposer((c) => ({ ...c, body: e.target.value }))}
            required={composer.mode === 'article'}
          />
          <div className="mt-3">
            <label className="text-sm text-slate-600">
              {composer.mode === 'meme' ? 'Image' : 'Image (optional)'}
            </label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full text-sm"
              onChange={(e) => setComposer((c) => ({ ...c, file: e.target.files?.[0] || null }))}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            Publish
          </button>
        </form>
      )}

      {loading && !posts.length ? (
        <div className="rounded-3xl bg-white/90 p-10 text-center text-slate-500">Loading…</div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 shadow-lg"
            >
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                  <span className="font-medium text-slate-800">{post.author?.name || 'Member'}</span>
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold uppercase text-indigo-700">
                    {post.post_type}
                  </span>
                </div>
                {post.title && <h3 className="mt-3 text-xl font-semibold text-slate-900">{post.title}</h3>}
                {post.body && <p className="mt-2 whitespace-pre-wrap text-slate-700">{post.body}</p>}
                {post.image_url && (
                  <img
                    src={imgUrl(post.image_url)}
                    alt=""
                    className="mt-4 max-h-96 w-full rounded-2xl object-contain ring-1 ring-slate-200/80"
                  />
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {REACTIONS.map(({ type, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => user && onReact(post.id, type, post.my_reaction)}
                      className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${
                        post.my_reaction === type
                          ? 'bg-indigo-600 text-white ring-indigo-600'
                          : 'bg-white/90 text-slate-700 ring-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      {label}{' '}
                      <span className="text-xs opacity-80">
                        {post.reaction_counts?.[type] > 0 ? post.reaction_counts[type] : ''}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => openThread(post.id)}
                    className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {expanded === post.id ? 'Hide thread' : `Comments (${post.comment_count || 0})`}
                  </button>
                  {user && (user.role === 'admin' || post.author?.id === user.id) && (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={async () => {
                        await deleteDiscussionPost(post.id);
                        setPosts((p) => p.filter((x) => x.id !== post.id));
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {expanded === post.id && threadLoading && (
                  <div className="mt-5 border-t border-slate-200/80 pt-4 text-sm text-slate-500">Loading thread…</div>
                )}
                {expanded === post.id && !threadLoading && thread?.post?.id === post.id && (
                  <div className="mt-5 border-t border-slate-200/80 pt-4">
                    <div className="space-y-3">
                      {(thread.comments || []).map((c) => (
                        <div key={c.id} className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                          <div className="text-xs font-medium text-slate-600">{c.author?.name || 'Member'}</div>
                          <p className="mt-1 text-sm text-slate-800">{c.content}</p>
                        </div>
                      ))}
                    </div>
                    {user && (
                      <div className="mt-4 flex gap-2">
                        <input
                          className="flex-1 rounded-2xl border border-slate-300 px-4 py-2 text-sm"
                          placeholder="Add a comment…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendComment(post.id))}
                        />
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => sendComment(post.id)}
                          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => load(offset)}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Load more
          </button>
        </div>
      )}
    </section>
  );
}

export default Discussions;
