export interface BookingDto {
  id: number;
  guid: string;
  serviceId: number;
  serviceName: string;
  branchId: number;
  queueSlotId: number;
  date: string;
  startTime: string;
  customerName: string;
  staffId?: number | null;
  staffName?: string | null;
  queueId?: number | null;
  status: string;
  remark?: string | null;
}

export interface CreateBookingDto {
  serviceId: number;
  branchId: number;
  queueSlotId: number;
  staffId?: number;
  remark?: string;
}

export interface AvailableSlotDto {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
}
