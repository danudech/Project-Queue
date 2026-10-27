import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useProfile } from "@/hooks/use-me";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/use-logout";

const getAvatarUrl = (url?: string | null): string => {
  if (!url || typeof url !== "string" || !url.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const cleanBase = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
};

const getInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return "U";
};

const ProfileInfo = () => {
  const t = useTranslations("Menu");
  const { data, isLoading } = useProfile();
  const { logout, isLoggingOut } = useLogout();

  if (isLoading) {
    return (
      <div className="md:block hidden">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-default-200 animate-pulse" />
          <div className="h-4 w-24 bg-default-200 animate-pulse rounded lg:block hidden" />
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(data?.profilePictureUrl);
  const initials = getInitials(data?.name, data?.email);
  const displayName = data?.name || data?.email || "Unknown User";

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="flex items-center gap-3 text-default-800 select-none">
            <Avatar className="size-9 rounded-full ring-2 ring-primary/20 shrink-0">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="object-cover object-center"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="text-sm font-medium capitalize lg:block hidden max-w-[150px] truncate">
              {displayName}
            </div>
            <span className="text-base me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down" />
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-3 items-center mb-1 p-3">
            <Avatar className="size-9 rounded-full ring-1 ring-default-200 shrink-0">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="object-cover object-center"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-default-800 capitalize truncate">
                {displayName}
              </div>
              <Link
                href="/account/profile"
                className="text-xs text-default-600 hover:text-primary block truncate"
              >
                {data?.email || ""}
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/account/profile" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:user" className="w-4 h-4" />
                {t("myProfile")}
              </DropdownMenuItem>
            </Link>
            <Link href="/setting/shop" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:cog-8-tooth" className="w-4 h-4" />
                {t("shopSettings")}
              </DropdownMenuItem>
            </Link>
            <Link href="/account/security" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:lock-closed" className="w-4 h-4" />
                {t("changePassword")}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer">
            <button
              type="button"
              className="flex w-full items-center gap-2"
              disabled={isLoggingOut}
              onClick={() => void logout()}
            >
              <Icon icon="heroicons:power" className="h-4 w-4" />
              {t("logout")}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileInfo;
