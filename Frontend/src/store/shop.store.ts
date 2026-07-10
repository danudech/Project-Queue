import { atom } from "jotai";
import { ShopResponse } from "@/types/shop/shop-responsd";

export const currentShopAtom = atom<ShopResponse | null>(null);
export const currentBranchIdAtom = atom<number | null>(null);
