export type SetCategory = {
  id?: number;
  name: string;
  shopId: number;
  branchId?: number;
  isActive: boolean;
}

export type ServiceCategoryType = {
  id: number;
  name: string;
  shopId: number;
  shopName: string;
  isActive: boolean;
  createdAt: string;
  branchId?: number;
};