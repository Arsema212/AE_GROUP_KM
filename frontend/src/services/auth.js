import api from './api';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function fetchMe(token) {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateProfile(payload, token) {
  const response = await api.put('/auth/me', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function changePassword(payload, token) {
  const response = await api.put('/auth/me/password', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
