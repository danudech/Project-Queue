import { USER_ROLES } from "../constants/user-roles";

export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: ["manage_shop", "manage_staff", "view_reports", "manage_queues"],
  [USER_ROLES.MANAGER]: ["manage_staff", "view_reports", "manage_queues"],
  [USER_ROLES.STAFF]: ["manage_queues"],
  [USER_ROLES.CUSTOMER]: ["book_queue", "view_own_queue"],
};

export const hasPermission = (role: string, permission: string) => {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]?.includes(permission) ?? false;
};
