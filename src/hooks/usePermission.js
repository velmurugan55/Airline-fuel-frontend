import { useAuth } from '../context/AuthContext';

/**
 * Returns a helper to check permissions from the current user's permission map.
 *
 * Usage:
 *   const { can, canAny } = usePermission();
 *   can('transactions', 'can_create')  // boolean
 *   canAny('reports')                  // true if user has any access to reports
 */
export const usePermission = () => {
  const { user } = useAuth();
  const permissions = user?.permissions || {};
  const role = user?.role || '';

  const isSuperAdmin = role === 'admin' && !user?.role_id;

  const can = (menuCode, action = 'can_view') => {
    if (isSuperAdmin) return true;
    const perm = permissions[menuCode];
    if (!perm) return false;
    return !!perm[action];
  };

  const canAny = (menuCode) => {
    if (isSuperAdmin) return true;
    const perm = permissions[menuCode];
    if (!perm) return false;
    return Object.values(perm).some(Boolean);
  };

  const canView     = (menuCode) => can(menuCode, 'can_view');
  const canCreate   = (menuCode) => can(menuCode, 'can_create');
  const canEdit     = (menuCode) => can(menuCode, 'can_edit');
  const canDelete   = (menuCode) => can(menuCode, 'can_delete');
  const canDownload = (menuCode) => can(menuCode, 'can_download');
  const canExport   = (menuCode) => can(menuCode, 'can_export');
  const canPrint    = (menuCode) => can(menuCode, 'can_print');

  return { can, canAny, canView, canCreate, canEdit, canDelete, canDownload, canExport, canPrint, permissions, isSuperAdmin };
};

export default usePermission;
