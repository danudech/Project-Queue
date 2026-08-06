export interface QueueDto {
  id: number;
  guid: string;
  bookingId?: number | null;
  queueNumber: number;
  customerName?: string | null;
  customerPhone?: string | null;
  queueDate?: string | null;
  queueStartTime?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  branchId: number;
  staffId?: number | null;
  staffName?: string | null;
  status: string;
  type: string;
  createdAt: string;
}

export interface AvailableSlotResponse {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  remaining: number;
  availableStaffIds: number[];
}

export interface CreateQueueDto {
  serviceId: number;
  branchId: number;
  queueSlotId: number;
  staffId?: number;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  type?: string;
}
