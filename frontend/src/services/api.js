import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchKnowledge({ q, type, language, region, tag }) {
  const params = { q, type, language, region, tag };
  const response = await api.get('/knowledge', { params });
  return response.data;
}

export async function createKnowledge(payload, token) {
  const response = await api.post('/knowledge', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchLessons() {
  const response = await api.get('/lessons');
  return response.data;
}

export async function submitLesson(payload, token) {
  const response = await api.post('/lessons', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchExperts(params = {}) {
  const response = await api.get('/users/experts', { params });
  return response.data;
}
