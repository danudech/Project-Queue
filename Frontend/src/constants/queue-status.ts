export const QUEUE_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type QueueStatusType = typeof QUEUE_STATUS[keyof typeof QUEUE_STATUS];
