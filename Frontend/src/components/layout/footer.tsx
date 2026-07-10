import React from "react";

export const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-0 h-auto md:h-14 flex items-center justify-center px-4 bg-background">
      <p className="text-xs text-muted-foreground text-center">
        &copy; {new Date().getFullYear()} QueueApp. All rights reserved.
      </p>
    </footer>
  );
};
