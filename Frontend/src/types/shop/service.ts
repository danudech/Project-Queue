export type SetService = {
    id?: number;
    name: string;
    shopId: string;
    shopName?: string;
    duration: number;
    price: number;
    categoryId: number;
    categoryName?: string;
    isActive: boolean;
    createdAt?: string;
}