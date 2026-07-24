export type StaffMember = {
  id: number;
  shopId: number;
  branchId: number;
  userId?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  canServeQueues: boolean;
  canLogin: boolean;
  isAvailable: boolean;
  isActive: boolean;
  emailConfirmed?: boolean | null;
  lastLoginAt?: string | null;
  profilePictureUrl?: string | null;
  serviceIds: number[];
};

export type SaveStaffMember = Omit<StaffMember, "id" | "userId"> & { id?: number };
