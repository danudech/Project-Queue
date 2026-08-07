export interface PublicBookingService {
  id: number;
  name: string;
  imageUrl?: string | null;
  duration: number;
  price: number;
  staffSelectionMode: "AUTO" | "OPTIONAL" | "REQUIRED" | string;
}

export interface PublicBookingStaff {
  id: number;
  name: string;
  profilePictureUrl?: string | null;
}

export interface PublicBookingSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
}

export interface PublicBookingPage {
  shopSlug: string;
  shopName: string;
  logoUrl?: string | null;
  logoPosition?: string | null;
  coverUrl?: string | null;
  coverPosition?: string | null;
  shopDescription?: string | null;
  shopEmail?: string | null;
  shopTypeNameTh?: string | null;
  shopTypeNameEn?: string | null;
  branchPublicId: string;
  branchName: string;
  branchPhone: string;
  branchAddress: string;
  isOnlineBookingEnabled: boolean;
  services: PublicBookingService[];
  staff: PublicBookingStaff[];
  slots: PublicBookingSlot[];
  businessHours: PublicBusinessHour[];
}

export interface PublicBusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isActive: boolean;
}

export interface PublicBookingConfirmation {
  guid: string;
  shopName: string;
  branchName: string;
  serviceName: string;
  date: string;
  startTime: string;
  customerName: string;
  staffName?: string | null;
  status: string;
  canCancel: boolean;
  managementToken: string;
}

export interface PublicBookingManagement {
  guid: string;
  shopSlug: string;
  branchPublicId: string;
  shopName: string;
  logoUrl?: string | null;
  shopTypeNameTh?: string | null;
  shopTypeNameEn?: string | null;
  shopEmail?: string | null;
  branchName: string;
  branchPhone: string;
  branchAddress: string;
  serviceName: string;
  date: string;
  startTime: string;
  customerName: string;
  staffName?: string | null;
  status: string;
  canCancel: boolean;
}
