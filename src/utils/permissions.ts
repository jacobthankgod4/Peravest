export enum Permission {
  // Property permissions
  PROPERTY_CREATE = 'property:create',
  PROPERTY_READ = 'property:read',
  PROPERTY_UPDATE = 'property:update',
  PROPERTY_DELETE = 'property:delete',
  
  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  
  // Investment permissions
  INVESTMENT_READ = 'investment:read',
  INVESTMENT_APPROVE = 'investment:approve',
  
  // Withdrawal permissions
  WITHDRAWAL_READ = 'withdrawal:read',
  WITHDRAWAL_APPROVE = 'withdrawal:approve',
  WITHDRAWAL_REJECT = 'withdrawal:reject',
  WITHDRAWAL_COMPLETE = 'withdrawal:complete',
  
  // KYC permissions
  KYC_READ = 'kyc:read',
  KYC_APPROVE = 'kyc:approve',
  KYC_REJECT = 'kyc:reject',
  
  // Ajo permissions
  AJO_READ = 'ajo:read',
  AJO_CREATE = 'ajo:create',
  AJO_UPDATE = 'ajo:update',
  AJO_PROCESS_PAYOUT = 'ajo:process_payout',
  
  // Analytics permissions
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // System permissions
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_AUDIT_LOGS = 'system:audit_logs'
}

export type Role = 'super_admin' | 'admin' | 'user';

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: Object.values(Permission), // All permissions
  
  admin: [
    Permission.PROPERTY_READ,
    Permission.PROPERTY_UPDATE,
    Permission.USER_READ,
    Permission.INVESTMENT_READ,
    Permission.WITHDRAWAL_READ,
    Permission.WITHDRAWAL_APPROVE,
    Permission.WITHDRAWAL_REJECT,
    Permission.WITHDRAWAL_COMPLETE,
    Permission.KYC_READ,
    Permission.KYC_APPROVE,
    Permission.KYC_REJECT,
    Permission.AJO_READ,
    Permission.AJO_UPDATE,
    Permission.AJO_PROCESS_PAYOUT,
    Permission.ANALYTICS_VIEW
  ],
  
  user: [
    Permission.PROPERTY_READ,
    Permission.INVESTMENT_READ
  ]
};

class PermissionManager {
  hasPermission(userRole: Role, permission: Permission): boolean {
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes(permission);
  }

  hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(userRole, p));
  }

  hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(userRole, p));
  }

  getUserPermissions(userRole: Role): Permission[] {
    return rolePermissions[userRole] || [];
  }

  canPerformAction(userRole: Role, action: string): boolean {
    const permission = action as Permission;
    return this.hasPermission(userRole, permission);
  }
}

export const permissionManager = new PermissionManager();
