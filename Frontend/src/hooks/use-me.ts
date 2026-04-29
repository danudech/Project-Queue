import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/client";
import { ProfileUser } from "@/types/user";
import { ShopResponse } from "@/types/shop/shop-responsd";

export const useProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => http.get<ProfileUser>("profile"),
  });
};

export const useShop = () => {
  return useQuery({
    queryKey: ["shop"],
    queryFn: () => http.get<ShopResponse>("shopdata"),
  });
}