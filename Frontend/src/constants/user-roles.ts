export const USER_ROLES = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
  CUSTOMER: "Customer",
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];
