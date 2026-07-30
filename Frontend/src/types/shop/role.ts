export type PermissionCatalogItem = {
  code: string;
  group: string;
};

export type ShopRole = {
  code: string;
  label: string;
  scope: "Shop" | "Branch";
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissionCodes: string[];
};

export type SaveShopRole = {
  shopId: number;
  code?: string;
  label: string;
  scope: "Shop" | "Branch";
  isActive: boolean;
  permissionCodes: string[];
};
