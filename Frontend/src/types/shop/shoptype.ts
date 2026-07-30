export type ShopType = {
    id: string;
    nameTh: string;
    nameEn: string;
};

export type AddShop = {
    shopId?: number;
    shopname: string;
    shoptype: string;
    branch: ShopBranch;
    businessHours: BusinessHour[];
};

export type ShopBranch = {
    branchName: string;
    branchPhone: string;
    branchAddress: BranchAddress;
};

export type BranchAddress = {
    houseNo: string;
    street: string;
    subdistrictId: number;
    districtId: number;
    provinceId: number;
    zipcode: string;
};

export type BusinessHour = {
    dayOfWeek: number
    isOpen: boolean
    openTime: string
    closeTime: string
}
