import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getDefaultDashboardPath(role) {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'manager') return '/dashboard/manager';
  return '/dashboard/staff';
}

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-8 py-6 text-sm shadow-soft">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultDashboardPath(user.role)} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
