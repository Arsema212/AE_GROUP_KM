import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers, updateUser, updateUserRole } from '../services/user';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

function UserManagement({ language }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = await fetchUsers(token);
      setUsers(data || []);
      setLoading(false);
    }
    loadUsers();
  }, [token]);

  const handleRoleChange = async (userId, role) => {
    await updateUserRole(userId, role, token);
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
  };

  const handleNameChange = async (userId, name) => {
    const updated = await updateUser(userId, { name }, token);
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, name: updated.name } : user)));
  };

  const handleDelete = async (userId) => {
    await deleteUser(userId, token);
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-brand-navy md:text-2xl">
        {t('manageUsers', language)}
      </h2>

      <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-soft">
        {loading ? (
          <div className="text-slate-600">Loading users...</div>
        ) : users.length ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <input
                    defaultValue={user.name}
                    onBlur={(e) => handleNameChange(user.id, e.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-900"
                  />
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2"
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="staff">staff</option>
                  </select>
                  <span className="text-sm text-slate-500">{t('userRole', language)}</span>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="rounded-xl bg-rose-600 px-3 py-2 text-sm text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-600">{t('noData', language)}</div>
        )}
      </section>
    </div>
  );
}

export default UserManagement;
