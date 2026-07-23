"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { http } from "@/lib/http/client";
import { startRouteLoading, stopRouteLoading } from "@/lib/route-loading";

export const useLogout = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    startRouteLoading();

    try {
      await http.get("signout");
      toast.success("Logged out");
      router.push("/auth/login");
    } catch {
      stopRouteLoading();
      setIsLoggingOut(false);
      toast.error("Logout failed");
    }
  }, [isLoggingOut, router]);

  return { logout, isLoggingOut };
};
