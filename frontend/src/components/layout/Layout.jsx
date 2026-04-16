import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ language, onLanguageToggle, search, setSearch }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-violet-400/10 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen">
        <Sidebar language={language} onLanguageToggle={onLanguageToggle} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar language={language} search={search} setSearch={setSearch} />
          <main className="flex-1 px-4 py-6 md:px-8 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
