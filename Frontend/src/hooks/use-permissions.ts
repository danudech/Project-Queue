import { useProfile } from "@/hooks/use-me";
import { hasPermission } from "@/lib/permissions";

const EMPTY_PERMISSIONS: string[] = [];

export function usePermissions() {
  const profile = useProfile();
  const permissions = profile.data?.permissions ?? EMPTY_PERMISSIONS;
  return {
    ...profile,
    permissions,
    can: (required?: string | readonly string[]) =>
      hasPermission(permissions, required),
  };
}
