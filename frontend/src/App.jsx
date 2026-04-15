import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Repository from './pages/Repository';
import LessonsLearned from './pages/LessonsLearned';
import Experts from './pages/Experts';
import Discussions from './pages/Discussions';
import { fetchExperts } from './services/api';
import translations from './i18n';

function App() {
  const [language, setLanguage] = useState('en');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [experts, setExperts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadExperts() {
      const data = await fetchExperts({ q: '', area: '' });
      setExperts(data || []);
    }
    loadExperts();
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-900">
      <div className="flex">
        <Sidebar language={language} onLanguageToggle={() => setLanguage(language === 'en' ? 'am' : 'en')} />
        <div className="flex-1 p-6">
          <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-800">AE Trade Group KMS</h1>
              <p className="text-slate-600">{t.dashboardSubtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
                {t.goToRepo}
              </button>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Navigate to="/repository" replace />} />
            <Route path="/repository" element={<Repository language={language} query={search} />} />
            <Route path="/lessons" element={<LessonsLearned language={language} />} />
            <Route path="/experts" element={<Experts experts={experts} />} />
            <Route path="/discussions" element={<Discussions />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
