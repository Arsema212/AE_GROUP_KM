import api from './api';

export async function fetchDiscussionPosts({ offset = 0, limit = 20 } = {}) {
  const { data } = await api.get('/discussions/posts', { params: { offset, limit } });
  return data;
}

export async function fetchDiscussionPost(id) {
  const { data } = await api.get(`/discussions/posts/${id}`);
  return data;
}

export async function createDiscussionPost(formData) {
  const { data } = await api.post('/discussions/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDiscussionPost(id) {
  const { data } = await api.delete(`/discussions/posts/${id}`);
  return data;
}

export async function addComment(postId, payload) {
  const { data } = await api.post(`/discussions/posts/${postId}/comments`, payload);
  return data;
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/discussions/comments/${commentId}`);
  return data;
}

export async function setReaction(postId, reactionType) {
  const { data } = await api.post(`/discussions/posts/${postId}/reactions`, { reaction_type: reactionType });
  return data;
}

export async function clearReaction(postId) {
  const { data } = await api.delete(`/discussions/posts/${postId}/reactions`);
  return data;
}
