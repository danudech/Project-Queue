import { http } from "@/lib/http/client";
import { ShopResponse } from "@/types/shop/shop-responsd";
import { ShopCategoryDto } from "@/types/shop-category";

export const shopService = {
  getShopByBranch: async (branchId: number): Promise<ShopResponse> => {
    return await http.get<ShopResponse>("shopdata", { params: { branchId } });
  },
  getShopCategories: async (): Promise<ShopCategoryDto[]> => {
    return await http.get<ShopCategoryDto[]>("shoptype");
  }
};
