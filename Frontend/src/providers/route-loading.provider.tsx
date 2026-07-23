"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import RouteLoadingScreen from "@/components/route-loading-screen";
import {
  ROUTE_LOADING_START_EVENT,
  ROUTE_LOADING_STOP_EVENT,
} from "@/lib/route-loading";

const MINIMUM_VISIBLE_MS = 450;
const ASSET_TIMEOUT_MS = 12_000;
const NAVIGATION_TIMEOUT_MS = 15_000;

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const waitForImage = (image: HTMLImageElement) => {
  if (image.complete) {
    return image.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const settle = () => resolve();
    image.addEventListener("load", settle, { once: true });
    image.addEventListener("error", settle, { once: true });
  });
};

const waitForPageAssets = async () => {
  await nextFrame();

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  const images = Array.from(document.images).filter((image) => {
    const rect = image.getBoundingClientRect();
    const isVisible =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth;

    return image.loading !== "lazy" || isVisible;
  });

  await Promise.race([
    Promise.all([fontsReady, ...images.map(waitForImage)]),
    new Promise<void>((resolve) => window.setTimeout(resolve, ASSET_TIMEOUT_MS)),
  ]);

  await nextFrame();
};

const isEligibleLinkClick = (event: MouseEvent, anchor: HTMLAnchorElement) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download") ||
    anchor.dataset.routeAction
  ) {
    return false;
  }

  const href = anchor.getAttribute("href");
  return Boolean(href && !href.startsWith("mailto:") && !href.startsWith("tel:"));
};

export default function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);
  const startedAtRef = useRef(0);
  const navigationIdRef = useRef(0);

  const stopLoading = useCallback(async (navigationId: number) => {
    await waitForPageAssets();

    const elapsed = Date.now() - startedAtRef.current;
    if (elapsed < MINIMUM_VISIBLE_MS) {
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, MINIMUM_VISIBLE_MS - elapsed),
      );
    }

    if (navigationId !== navigationIdRef.current) return;

    loadingRef.current = false;
    document.documentElement.removeAttribute("data-route-loading");
    setIsLoading(false);
  }, []);

  const startLoading = useCallback(() => {
    const navigationId = ++navigationIdRef.current;
    loadingRef.current = true;
    startedAtRef.current = Date.now();
    document.documentElement.setAttribute("data-route-loading", "true");
    setIsLoading(true);

    window.setTimeout(() => {
      if (navigationId === navigationIdRef.current && loadingRef.current) {
        void stopLoading(navigationId);
      }
    }, NAVIGATION_TIMEOUT_MS);

    return navigationId;
  }, [stopLoading]);

  useEffect(() => {
    if (!loadingRef.current) return;
    void stopLoading(navigationIdRef.current);
  }, [pathname, stopLoading]);

  useEffect(() => {
    const handleProgrammaticNavigation = () => {
      startLoading();
    };
    const handleNavigationFailure = () => {
      if (!loadingRef.current) return;
      void stopLoading(navigationIdRef.current);
    };

    window.addEventListener(ROUTE_LOADING_START_EVENT, handleProgrammaticNavigation);
    window.addEventListener(ROUTE_LOADING_STOP_EVENT, handleNavigationFailure);
    return () => {
      window.removeEventListener(ROUTE_LOADING_START_EVENT, handleProgrammaticNavigation);
      window.removeEventListener(ROUTE_LOADING_STOP_EVENT, handleNavigationFailure);
    };
  }, [startLoading, stopLoading]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !isEligibleLinkClick(event, anchor)) return;

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, currentUrl);
      const isSameDocument =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search;

      if (nextUrl.origin !== currentUrl.origin || isSameDocument) return;

      const navigationId = startLoading();
      const startingHref = currentUrl.href;

      const watchUrlChange = () => {
        if (navigationId !== navigationIdRef.current || !loadingRef.current) return;

        if (window.location.href !== startingHref) {
          void stopLoading(navigationId);
          return;
        }

        requestAnimationFrame(watchUrlChange);
      };

      requestAnimationFrame(watchUrlChange);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startLoading, stopLoading]);

  return (
    <>
      {children}
      <RouteLoadingScreen visible={isLoading} />
    </>
  );
}
