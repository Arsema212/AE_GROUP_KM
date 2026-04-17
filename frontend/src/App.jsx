import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repository from './pages/Repository';
import LessonsLearned from './pages/LessonsLearned';
import Experts from './pages/Experts';
import Discussions from './pages/Discussions';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import Register from './pages/Register';

function App() {
  const [language, setLanguage] = useState('en');
  const [search, setSearch] = useState('');

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login language={language} />} />
        <Route path="/register" element={<Register language={language} />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'am' : 'en')} search={search} setSearch={setSearch} />}>
            <Route path="/" element={<Navigate to="/dashboard/staff" replace />} />
            <Route path="/dashboard" element={<Navigate to="/dashboard/staff" replace />} />
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<Dashboard language={language} role="admin" />} />
            </Route>
            <Route path="/dashboard/manager" element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route index element={<Dashboard language={language} role="manager" />} />
            </Route>
            <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route index element={<Dashboard language={language} role="staff" />} />
            </Route>
            <Route path="/repository" element={<Repository language={language} query={search} />} />
            <Route path="/lessons" element={<LessonsLearned language={language} />} />
            <Route path="/experts" element={<Experts language={language} />} />
            <Route path="/discussions" element={<Discussions language={language} />} />
            <Route path="/profile" element={<Profile language={language} />} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<UserManagement language={language} />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
