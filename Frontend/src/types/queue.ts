export interface QueueDto {
  id: number;
  queueNumber: string;
  customerId: number;
  serviceId: number;
  branchId: number;
  status: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateQueueDto {
  customerId: number;
  serviceId: number;
  branchId: number;
}
