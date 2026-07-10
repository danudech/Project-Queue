import { http } from "@/lib/http/client";
import { QueueDto, CreateQueueDto } from "@/types/queue";

export const queueService = {
  getQueuesByBranch: async (branchId: number): Promise<QueueDto[]> => {
    return await http.get<QueueDto[]>("/queue", { params: { branchId } });
  },
  getQueueById: async (id: number): Promise<QueueDto> => {
    return await http.get<QueueDto>(`/queue/${id}`);
  },
  createQueue: async (data: CreateQueueDto): Promise<QueueDto> => {
    return await http.post<QueueDto>("/queue", data);
  },
  updateQueueStatus: async (id: number, status: string): Promise<QueueDto> => {
    return await http.put<QueueDto>(`/queue/${id}/status`, { status });
  },
};
