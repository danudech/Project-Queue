import { SetService } from "./service";

export interface ShopResponse {
  id: number;
  name: string;
  publicSlug: string;
  type: string;
  address: string;
  phone: string;
  status: number;
  ownerId: number;
  shopHours: ShopBusinessHour[];
  shopHolidays: ShopHoliday[];
  shopBranches: BranchDto[];
  services: SetService[];
  logo : string;
  isActive : boolean;
  description?: string;
  email?: string;
}

export interface ShopBusinessHour {
  shopId: number;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface ShopHoliday {
  shopId: number;
  date: string;
  description?: string;
}

export interface BranchDto {
  id: number;
  guid: string;
  publicBookingId: string;
  isOnlineBookingEnabled: boolean;
  name: string;
  phone: string;
  address?: AddressDto;
  isSelected?: boolean;
}

export interface AddressDto {
  houseNo: string;
  street: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
  fullAddress: string;
}
