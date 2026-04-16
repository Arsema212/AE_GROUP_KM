import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';
import { getApiOrigin } from '../services/api';
import {
  addComment,
  clearReaction,
  createDiscussionPost,
  deleteComment,
  deleteDiscussionPost,
  fetchDiscussionPost,
  fetchDiscussionPosts,
  setReaction,
} from '../services/discussions';

const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Like' },
  { key: 'love', emoji: '❤️', label: 'Love' },
  { key: 'laugh', emoji: '😂', label: 'Haha' },
  { key: 'insight', emoji: '💡', label: 'Insight' },
  { key: 'celebrate', emoji: '🎉', label: 'Celebrate' },
];

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString();
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function nestComments(flat) {
  const map = new Map();
  for (const c of flat) {
    map.set(c.id, { ...c, replies: [] });
  }
  const roots = [];
  for (const c of flat) {
    const node = map.get(c.id);
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id).replies.push(node);
    } else if (!c.parent_id) {
      roots.push(node);
    }
  }
  return roots;
}

function CommentTree({ nodes, depth, onDelete, currentUserId, isAdmin, postId, setReplyingTo, canInteract }) {
  return (
    <ul className={depth ? 'ml-4 mt-3 border-l-2 border-indigo-100 pl-4 space-y-3' : 'space-y-4'}>
      {nodes.map((c) => (
        <li key={c.id}>
          <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow">
                  {initials(c.author?.name)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{c.author?.name || 'Member'}</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{c.content}</p>
                </div>
              </div>
              {(currentUserId === c.author?.id || isAdmin) && (
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
            {canInteract && (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                onClick={() => setReplyingTo({ postId, parentId: c.id })}
              >
                Reply
              </button>
            )}
          </div>
          {c.replies?.length > 0 && (
            <CommentTree
              nodes={c.replies}
              depth={depth + 1}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              postId={postId}
              setReplyingTo={setReplyingTo}
              canInteract={canInteract}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function PostCard({
  post,
  expanded,
  onToggleExpand,
  onReact,
  onDeletePost,
  commentDraft,
  setCommentDraft,
  onSubmitComment,
  onDeleteComment,
  commentsByPost,
  loadingComments,
  replyingTo,
  setReplyingTo,
  user,
  language,
}) {
  const origin = getApiOrigin();
  const imgSrc = post.image_url ? `${origin}${post.image_url}` : null;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-indigo-500/10 transition hover:shadow-xl hover:shadow-indigo-500/15">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="p-6 sm:p-8">
        <header className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md">
            {initials(post.author?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">{post.author?.name || 'Member'}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  post.post_type === 'meme'
                    ? 'bg-fuchsia-100 text-fuchsia-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {post.post_type === 'meme' ? 'Meme' : 'Article'}
              </span>
              <span className="text-xs text-slate-400">{timeAgo(post.created_at)}</span>
            </div>
            {post.title && <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-900">{post.title}</h3>}
          </div>
          {user && (user.id === post.author?.id || user.role === 'admin') && (
            <button
              type="button"
              onClick={() => onDeletePost(post.id)}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              Delete
            </button>
          )}
        </header>

        {post.body ? <p className="mt-4 whitespace-pre-wrap text-slate-700 leading-relaxed">{post.body}</p> : null}

        {imgSrc && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            <img src={imgSrc} alt="" className="max-h-[420px] w-full object-contain" loading="lazy" />
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {REACTIONS.map((r) => {
            const count = post.reaction_counts?.[r.key] || 0;
            const active = post.my_reaction === r.key;
            return (
              <button
                key={r.key}
                type="button"
                title={r.label}
                onClick={() => onReact(post.id, r.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-white'
                }`}
              >
                <span className="text-base">{r.emoji}</span>
                {count > 0 && <span className="text-xs font-medium tabular-nums">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => onToggleExpand(post.id)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {expanded ? 'Hide comments' : `${post.comment_count || 0} comments · Join the conversation`}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            {loadingComments[post.id] ? (
              <p className="text-sm text-slate-500">Loading comments…</p>
            ) : (
              <>
                <CommentTree
                  nodes={nestComments(commentsByPost[post.id] || [])}
                  depth={0}
                  onDelete={(cid) => onDeleteComment(post.id, cid)}
                  currentUserId={user?.id}
                  isAdmin={user?.role === 'admin'}
                  postId={post.id}
                  setReplyingTo={setReplyingTo}
                  canInteract={!!user}
                />
                {user && (
                  <div className="mt-4 space-y-2">
                    {replyingTo?.postId === post.id && replyingTo?.parentId && (
                      <p className="text-xs text-slate-500">
                        Replying to thread ·{' '}
                        <button type="button" className="text-indigo-600" onClick={() => setReplyingTo(null)}>
                          Cancel
                        </button>
                      </p>
                    )}
                    <textarea
                      value={commentDraft[post.id] || ''}
                      onChange={(e) => setCommentDraft((d) => ({ ...d, [post.id]: e.target.value }))}
                      placeholder="Write a comment…"
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSubmitComment(post.id)}
                        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:from-indigo-700 hover:to-violet-700"
                      >
                        {t('postComment', language)}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function CreatePostModal({ open, onClose, onCreated, language }) {
  const [tab, setTab] = useState('article');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (tab === 'meme' && !file) {
      setError('Please choose an image for your meme.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('post_type', tab);
      if (tab === 'article') {
        fd.append('title', title);
        fd.append('body', body);
      } else {
        fd.append('body', body);
        fd.append('image', file);
      }
      const created = await createDiscussionPost(fd);
      onCreated(created);
      setTitle('');
      setBody('');
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not create post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200/80 bg-white shadow-lift sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h3 className="font-display text-base font-semibold text-brand-navy">{t('newDiscussionPost', language)}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-1">
            <button
              type="button"
              onClick={() => setTab('article')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                tab === 'article'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('article', language)}
            </button>
            <button
              type="button"
              onClick={() => setTab('meme')}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                tab === 'meme'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('meme', language)}
            </button>
          </div>
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {tab === 'article' ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('postTitle', language)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('postBody', language)}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('memeCaption', language)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60"
          >
            {saving ? '…' : t('publish', language)}
          </button>
        </form>
      </div>
    </div>
  );
}

function Discussions({ language }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentDraft, setCommentDraft] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const load = useCallback(async (from = 0) => {
    setError('');
    setLoading(from === 0);
    try {
      const data = await fetchDiscussionPosts({ offset: from, limit: 15 });
      const list = data.posts || [];
      setPosts((prev) => (from === 0 ? list : [...prev, ...list]));
      setOffset(from + list.length);
      setHasMore(data.has_more);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const toggleExpand = async (postId) => {
    const willOpen = !expanded[postId];
    setExpanded((e) => ({ ...e, [postId]: !e[postId] }));
    if (willOpen && !commentsByPost[postId]) {
      setLoadingComments((l) => ({ ...l, [postId]: true }));
      try {
        const data = await fetchDiscussionPost(postId);
        setCommentsByPost((c) => ({ ...c, [postId]: data.comments || [] }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, ...data.post, comment_count: data.comments?.length ?? p.comment_count }
              : p
          )
        );
      } catch (e) {
        setError(e.response?.data?.error || 'Could not load comments');
      } finally {
        setLoadingComments((l) => ({ ...l, [postId]: false }));
      }
    }
  };

  const handleReact = async (postId, key) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const res = post.my_reaction === key ? await clearReaction(postId) : await setReaction(postId, key);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                my_reaction: res.my_reaction ?? null,
                reaction_counts: res.reaction_counts || {},
              }
            : p
        )
      );
    } catch (e) {
      setError(e.response?.data?.error || 'Reaction failed');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDiscussionPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      setError(e.response?.data?.error || 'Delete failed');
    }
  };

  const handleSubmitComment = async (postId) => {
    const text = (commentDraft[postId] || '').trim();
    if (!text) return;
    try {
      const parentId =
        replyingTo?.postId === postId && replyingTo?.parentId ? replyingTo.parentId : null;
      const created = await addComment(postId, { content: text, parent_id: parentId });
      setCommentDraft((d) => ({ ...d, [postId]: '' }));
      setCommentsByPost((c) => ({
        ...c,
        [postId]: [...(c[postId] || []), created],
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
      );
      setReplyingTo(null);
    } catch (e) {
      setError(e.response?.data?.error || 'Comment failed');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(commentId);
      setCommentsByPost((c) => ({
        ...c,
        [postId]: (c[postId] || []).filter((x) => x.id !== commentId),
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 0) - 1) } : p))
      );
    } catch (e) {
      setError(e.response?.data?.error || 'Could not delete comment');
    }
  };

  const onCreated = (created) => {
    setPosts((prev) => [{ ...created, comment_count: 0, reaction_counts: {} }, ...prev]);
  };

  return (
    <section className="space-y-6 pb-24">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow md:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-900/20 blur-2xl" />
        <div className="relative">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{t('discussions', language)}</h2>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {user && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="fixed bottom-8 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-glow transition hover:from-indigo-700 hover:to-violet-700 md:bottom-10"
        >
          <span className="text-lg leading-none">+</span>
          {t('newPost', language)}
        </button>
      )}

      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={onCreated}
        language={language}
      />

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-200/60" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/90 p-10 text-center text-sm text-slate-500 shadow-soft">
          {t('discussionsEmpty', language)}
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-7">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              expanded={!!expanded[post.id]}
              onToggleExpand={toggleExpand}
              onReact={handleReact}
              onDeletePost={handleDeletePost}
              commentDraft={commentDraft}
              setCommentDraft={setCommentDraft}
              onSubmitComment={handleSubmitComment}
              onDeleteComment={handleDeleteComment}
              commentsByPost={commentsByPost}
              loadingComments={loadingComments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              user={user}
              language={language}
            />
          ))}
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => load(offset)}
            className="rounded-full border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 to-violet-50/90 px-8 py-3 text-sm font-semibold text-indigo-900 shadow-sm transition hover:from-indigo-100 hover:to-violet-100"
          >
            {t('loadMore', language)}
          </button>
        </div>
      )}
    </section>
  );
}

export default Discussions;
