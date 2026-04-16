import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, fetchMe } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('kms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (token) {
        try {
          const data = await fetchMe(token);
          setUser(data.user);
        } catch (err) {
          console.error(err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('kms_token');
        }
      }
      setLoading(false);
    }
    restore();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    localStorage.setItem('kms_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kms_token');
  };

  const updateUser = (updated) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
