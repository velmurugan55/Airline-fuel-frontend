import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PermissionGuard = ({ menuCode, children }) => {
  const { user } = useAuth();
  const pathname = window.location.pathname;
  const menus = user?.menus || [];

  let code = menuCode;
  if (!code) {
    const match = menus.find(m => m.route_path === pathname);
    if (match) code = match.menu_code;
  }

  const permissions = user?.permissions || {};
  const role = user?.role || '';
  const isSuperAdmin = role === 'admin' && !user?.role_id;

  if (isSuperAdmin) return children;

  // If no menu matched this route, allow root path (prevents infinite redirect)
  if (!code) {
    if (pathname === "/") return children;
    return <Navigate to="/" replace />;
  }

  const perm = permissions[code];
  if (!perm?.can_view) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PermissionGuard;
