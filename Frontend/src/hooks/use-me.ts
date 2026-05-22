import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/client";
import { ProfileUser } from "@/types/user";
import { ShopResponse } from "@/types/shop/shop-responsd";
import { storage } from "@/services/localstorage";
import React, { useEffect, useState } from "react";

export const useProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => http.get<ProfileUser>("profile"),
  });
};

export const useShop = () => {
  const [branchId, setBranchId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const getBranchId = async () => {
      const branchselect: number | null = (await storage.get("branch")) ?? null;
      setBranchId(branchselect);
      setIsReady(true); // รอให้ได้ค่าก่อนค่อย fetch
    };
    getBranchId();
  }, []);

  return useQuery({
    queryKey: ["shop", branchId], // ใส่ branchId ใน key → re-fetch เมื่อเปลี่ยน
    queryFn: () =>
      http.get<ShopResponse>("shopdata", {
        params: { ...(branchId && { branchId }) },
      }),
    enabled: isReady, // ไม่ fetch จนกว่าจะอ่าน storage เสร็จ
  });
};