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

export async function updateUser(userId, payload, token) {
  const response = await api.put(`/users/${userId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteUser(userId, token) {
  const response = await api.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
