import axios from 'axios';

function normalizeApiBase(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim().replace(/\s+/g, '');
  if (!trimmed) return null;
  if (trimmed.startsWith('/')) return '/api';
  return trimmed.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE)
  || (import.meta.env.DEV ? 'http://localhost:4000/api' : 'https://ae-group-km-api.vercel.app/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
