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
  serviceIds: number[];
};

export type SaveStaffMember = Omit<StaffMember, "id" | "userId"> & { id?: number };
