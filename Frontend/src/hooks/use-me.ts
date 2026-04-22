import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http/client";
import { ProfileUser } from "@/types/user";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => http.get<ProfileUser>("profile"),
  });
};