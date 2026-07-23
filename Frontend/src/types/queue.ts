export interface QueueDto {
  id: number;
  guid: string;
  queueNumber: number;
  customerName?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  branchId: number;
  staffId?: number | null;
  staffName?: string | null;
  status: string;
  type: string;
  createdAt: string;
}

export interface CreateQueueDto {
  serviceId: number;
  branchId: number;
  staffId?: number;
  customerName?: string;
  type?: string;
}
