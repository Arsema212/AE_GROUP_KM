import api from './api';

export async function fetchUsers(token) {
  const response = await api.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateUserRole(userId, role, token) {
  const response = await api.put(
    `/users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
