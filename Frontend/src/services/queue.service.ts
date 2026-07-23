import { http } from "@/lib/http/client";
import { QueueDto, CreateQueueDto } from "@/types/queue";

export const queueService = {
  getQueuesByBranch: async (branchId: number): Promise<QueueDto[]> => {
    return await http.get<QueueDto[]>("queues", { params: { branchId } });
  },
  createQueue: async (data: CreateQueueDto): Promise<QueueDto> => {
    return await http.post<QueueDto>("queues", data);
  },
  updateQueueStatus: async (id: number, status: string): Promise<QueueDto> => {
    return await http.patch<QueueDto>("queues", { id, status });
  },
};
