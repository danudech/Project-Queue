import React from "react";
import { NavigationDrawer } from "../partials/navigation-drawer";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/user.store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const user = useAtomValue(userAtom);

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 lg:px-8 bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <NavigationDrawer />
        <h1 className="text-xl font-bold md:hidden">QueueApp</h1>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:block">{user.name || "User"}</span>
            <Avatar>
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        ) : null}
      </div>
    </header>
  );
};
