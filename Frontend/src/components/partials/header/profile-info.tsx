import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Icon } from "@/components/ui/icon"
import { useProfile } from "@/hooks/use-me";
import { Link } from '@/i18n/routing';
import { useTranslations } from "next-intl";
import { useLogout } from "@/hooks/use-logout";

const ProfileInfo = () => {

  const t = useTranslations("Menu");
  const { data, isLoading } = useProfile();
  const { logout, isLoggingOut } = useLogout();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            <Image
              src={data?.profilePictureUrl ? `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${data.profilePictureUrl}` : "https://avatars.githubusercontent.com/u/9919?s=200&v=4"}
              alt={data?.name || "User Avatar"}
              width={36}
              height={36}
              className="rounded-full object-cover object-center w-9 h-9 flex-shrink-0"
            />

            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              {data?.name || data?.email || "Unknown User"}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">

            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                {data?.name || data?.email || "Unknown User"}
              </div>
              <Link
                href="/dashboard"
                className="text-xs text-default-600 hover:text-primary"
              >
                {data?.email || ""}
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/account/profile" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:user" className="w-4 h-4" />
                {t('myProfile')}
              </DropdownMenuItem>
            </Link>
            <Link href="/setting/shop" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:cog-8-tooth" className="w-4 h-4" />
                {t('shopSettings')}
              </DropdownMenuItem>
            </Link>
            <Link href="/account/security" className="cursor-pointer">
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 px-3 py-1.5 cursor-pointer">
                <Icon icon="heroicons:lock-closed" className="w-4 h-4" />
                {t('changePassword')}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem

            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >

            <button
              type="button"
              className="flex w-full items-center gap-2"
              disabled={isLoggingOut}
              onClick={() => void logout()}
            >
              <Icon icon="heroicons:power" className="h-4 w-4" />
              {t('logout')}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default ProfileInfo;
