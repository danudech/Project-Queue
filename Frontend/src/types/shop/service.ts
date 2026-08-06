export type SetService = {
    id?: number;
    name: string;
    shopId: string;
    branchId?: string;
    shopName?: string;
    duration: number;
    price: number;
    categoryId: number;
    categoryName?: string;
    isActive: boolean;
    staffSelectionMode: "AUTO" | "OPTIONAL" | "REQUIRED";
    staffIds: number[];
    slotInterval?: number | null;
    advanceBookingWindow?: number | null;
    bufferBetweenServices?: number | null;
    createdAt?: string;
}
