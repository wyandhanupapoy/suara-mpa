/**
 * Staff Management Utilities
 * Handles user roles, permissions, and staff operations
 */

// User roles hierarchy
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF_LEAD: 'staff_lead',
  STAFF: 'staff'
};

// Permissions mapping
export const PERMISSIONS = {
  // Aspiration permissions
  VIEW_ASPIRATIONS: 'view_aspirations',
  VIEW_ALL_ASPIRATIONS: 'view_all_aspirations',
  VIEW_ASSIGNED_ONLY: 'view_assigned_only',
  UPDATE_ASPIRATION: 'update_aspiration',
  DELETE_ASPIRATION: 'delete_aspiration',
  ASSIGN_ASPIRATION: 'assign_aspiration',
  
  // Staff management
  MANAGE_STAFF: 'manage_staff',
  VIEW_STAFF: 'view_staff',
  
  // Analytics & Reports
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // Templates
  MANAGE_TEMPLATES: 'manage_templates',
  USE_TEMPLATES: 'use_templates',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings'
};

// Role permissions matrix
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ALL_ASPIRATIONS,
    PERMISSIONS.UPDATE_ASPIRATION,
    PERMISSIONS.DELETE_ASPIRATION,
    PERMISSIONS.ASSIGN_ASPIRATION,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.USE_TEMPLATES
  ],
  
  [ROLES.STAFF_LEAD]: [
    PERMISSIONS.VIEW_ALL_ASPIRATIONS,
    PERMISSIONS.UPDATE_ASPIRATION,
    PERMISSIONS.ASSIGN_ASPIRATION,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.USE_TEMPLATES
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_ASSIGNED_ONLY,
    PERMISSIONS.UPDATE_ASPIRATION,
    PERMISSIONS.USE_TEMPLATES
  ]
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Check if user can perform action on aspiration
 */
export const canAccessAspiration = (user, aspiration) => {
  if (!user || !aspiration) return false;
  
  // Super admin and admin can access all
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN) {
    return true;
  }
  
  // Staff lead can access all
  if (user.role === ROLES.STAFF_LEAD) {
    return true;
  }
  
  // Staff can only access assigned aspirations
  if (user.role === ROLES.STAFF) {
    return aspiration.assignedTo === user.uid;
  }
  
  return false;
};

/**
 * Get role display name
 */
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.ADMIN]: 'Admin',
    [ROLES.STAFF_LEAD]: 'Staff Lead',
    [ROLES.STAFF]: 'Staff'
  };
  return labels[role] || role;
};

/**
 * Get role color for UI
 */
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.SUPER_ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
    [ROLES.ADMIN]: 'bg-blue-100 text-blue-700 border-blue-200',
    [ROLES.STAFF_LEAD]: 'bg-green-100 text-green-700 border-green-200',
    [ROLES.STAFF]: 'bg-gray-100 text-gray-700 border-gray-200'
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

/**
 * Filter aspirations based on user permissions
 */
export const filterAspirationsByPermission = (aspirations, user) => {
  if (!user || !aspirations) return [];
  
  // Admin and staff lead see all
  if (hasPermission(user.role, PERMISSIONS.VIEW_ALL_ASPIRATIONS)) {
    return aspirations;
  }
  
  // Staff see only assigned
  if (user.role === ROLES.STAFF) {
    return aspirations.filter(asp => asp.assignedTo === user.uid);
  }
  
  return [];
};

/**
 * Get available staff for assignment
 */
export const getAvailableStaff = (allStaff, currentUser) => {
  if (!allStaff || !currentUser) return [];
  
  // Super admin and admin can assign to anyone
  if (hasPermission(currentUser.role, PERMISSIONS.ASSIGN_ASPIRATION)) {
    return allStaff.filter(staff => 
      staff.role === ROLES.STAFF || 
      staff.role === ROLES.STAFF_LEAD ||
      staff.role === ROLES.ADMIN
    );
  }
  
  return [];
};

/**
 * Create assignment history entry
 */
export const createAssignmentHistory = (fromUser, toUser, aspiration) => {
  return {
    timestamp: new Date(),
    fromUserId: fromUser?.uid || null,
    fromUserName: fromUser?.displayName || 'System',
    toUserId: toUser?.uid || null,
    toUserName: toUser?.displayName || 'Unassigned',
    aspirationId: aspiration.id,
    action: toUser ? 'assigned' : 'unassigned'
  };
};

/**
 * Get staff statistics
 */
export const getStaffStats = (aspirations, staffId) => {
  const staffAspirations = aspirations.filter(asp => asp.assignedTo === staffId);
  
  const stats = {
    total: staffAspirations.length,
    pending: 0,
    inProgress: 0,
    finished: 0
  };
  
  staffAspirations.forEach(asp => {
    if (asp.status === 'received' || asp.status === 'verified') {
      stats.pending++;
    } else if (asp.status === 'process' || asp.status === 'followed_up') {
      stats.inProgress++;
    } else if (asp.status === 'finished') {
      stats.finished++;
    }
  });
  
  return stats;
};

/**
 * Check if user can assign to specific staff
 */
export const canAssignTo = (currentUser, targetStaff) => {
  if (!currentUser || !targetStaff) return false;
  
  // Check if user has assign permission
  if (!hasPermission(currentUser.role, PERMISSIONS.ASSIGN_ASPIRATION)) {
    return false;
  }
  
  // Super admin can assign to anyone
  if (currentUser.role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // Admin can assign to staff and staff_lead
  if (currentUser.role === ROLES.ADMIN) {
    return [ROLES.STAFF, ROLES.STAFF_LEAD, ROLES.ADMIN].includes(targetStaff.role);
  }
  
  // Staff lead can assign to staff only
  if (currentUser.role === ROLES.STAFF_LEAD) {
    return targetStaff.role === ROLES.STAFF;
  }
  
  return false;
};

/**
 * Validate staff data
 */
export const validateStaffData = (staffData) => {
  const errors = [];
  
  if (!staffData.email || !staffData.email.includes('@')) {
    errors.push('Email tidak valid');
  }
  
  if (!staffData.displayName || staffData.displayName.trim().length < 3) {
    errors.push('Nama harus minimal 3 karakter');
  }
  
  if (!staffData.role || !Object.values(ROLES).includes(staffData.role)) {
    errors.push('Role tidak valid');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
