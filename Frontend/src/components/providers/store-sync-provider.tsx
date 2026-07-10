"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { userAtom } from "@/store/user.store";
import { currentShopAtom } from "@/store/shop.store";
import { useProfile, useShop } from "@/hooks/use-me";

export function StoreSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfile();
  const { data: shop } = useShop();

  const setUser = useSetAtom(userAtom);
  const setShop = useSetAtom(currentShopAtom);

  useEffect(() => {
    if (profile) {
      setUser(profile);
    } else {
      setUser(null);
    }
  }, [profile, setUser]);

  useEffect(() => {
    if (shop) {
      setShop(shop);
    } else {
      setShop(null);
    }
  }, [shop, setShop]);

  return <>{children}</>;
}
