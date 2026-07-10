import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queueService } from "@/services/queue.service";
import { CreateQueueDto } from "@/types/queue";
import { useAtomValue } from "jotai";
import { currentBranchIdAtom } from "@/store/shop.store";

export const useQueue = () => {
  const queryClient = useQueryClient();
  const branchId = useAtomValue(currentBranchIdAtom);

  const getQueues = useQuery({
    queryKey: ["queues", branchId],
    queryFn: () => queueService.getQueuesByBranch(branchId!),
    enabled: !!branchId,
  });

  const createQueue = useMutation({
    mutationFn: (data: CreateQueueDto) => queueService.createQueue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", branchId] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      queueService.updateQueueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queues", branchId] });
    },
  });

  return {
    getQueues,
    createQueue,
    updateStatus,
  };
};
