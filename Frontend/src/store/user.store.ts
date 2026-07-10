import { atom } from "jotai";
import { ProfileUser } from "@/types/user";

export const userAtom = atom<ProfileUser | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
