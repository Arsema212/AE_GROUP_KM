import api from './api';

export async function fetchKnowledge({ q, type, language, region, tag }) {
  const params = { q, type, language, region, tag };
  const response = await api.get('/knowledge', { params });
  return response.data;
}

export async function submitKnowledge(formData) {
  const response = await api.post('/knowledge', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function fetchLessons() {
  const response = await api.get('/lessons');
  return response.data;
}

export async function submitLesson(payload) {
  const response = await api.post('/lessons', payload);
  return response.data;
}

export async function fetchExperts(params = {}) {
  const response = await api.get('/users/experts', { params });
  return response.data;
}
