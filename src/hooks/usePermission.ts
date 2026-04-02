import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { Permission, permissionManager, Role } from '../utils/permissions';

export const usePermission = () => {
  const { user } = useAuth();

  const userRole: Role = useMemo(() => {
    // Determine user role from user object
    if (user?.role === 'admin') {
      return 'admin';
    }
    return 'user';
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return permissionManager.hasPermission(userRole, permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissionManager.hasAnyPermission(userRole, permissions);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissionManager.hasAllPermissions(userRole, permissions);
  };

  const canPerformAction = (action: string): boolean => {
    return permissionManager.canPerformAction(userRole, action);
  };

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    permissions: permissionManager.getUserPermissions(userRole)
  };
};
