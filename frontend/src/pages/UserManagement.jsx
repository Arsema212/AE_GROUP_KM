import { useEffect, useState } from 'react';
import { fetchUsers, updateUserRole } from '../services/user';
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

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-slate-900">{t('manageUsers', language)}</h2>
        <p className="mt-2 text-slate-600">Assign roles and track the people who manage knowledge.</p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-lg">
        {loading ? (
          <div className="text-slate-600">Loading users...</div>
        ) : users.length ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
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
