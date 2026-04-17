import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ language, onLanguageToggle, search, setSearch }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar language={language} onLanguageToggle={onLanguageToggle} />
        <div className="flex-1 flex flex-col">
          <Topbar language={language} search={search} setSearch={setSearch} />
          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
