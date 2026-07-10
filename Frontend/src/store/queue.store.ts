import { atom } from "jotai";
import { QueueDto } from "@/types/queue";

export const activeQueuesAtom = atom<QueueDto[]>([]);
export const selectedQueueAtom = atom<QueueDto | null>(null);
