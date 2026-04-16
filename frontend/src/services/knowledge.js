import api from './api';

export async function fetchKnowledge({ q, type, language, region, tag, status }) {
  const params = { q, type, language, region, tag, status };
  const response = await api.get('/knowledge', { params });
  return response.data;
}

export async function submitKnowledge(formData) {
  const response = await api.post('/knowledge', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function fetchLessons(params = {}) {
  const response = await api.get('/lessons', { params });
  return response.data;
}

export async function fetchLessonsByStatus(status, extra = {}) {
  const response = await api.get('/lessons', { params: { status, ...extra } });
  return response.data;
}

export async function submitLesson(payload) {
  const response = await api.post('/lessons', payload);
  return response.data;
}

export async function reviewKnowledge(id, action) {
  const response = await api.put(`/knowledge/${id}/review`, { action });
  return response.data;
}

export async function reviewLesson(id, action) {
  const response = await api.put(`/lessons/${id}/review`, { action });
  return response.data;
}

export async function fetchExperts(params = {}) {
  const response = await api.get('/users/experts', { params });
  return response.data;
}
