import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { getHomepageLocale } from "./i18n";
import RouteLoadingProvider from "@/providers/route-loading.provider";
import "@/styles/route-loading.css";
import { env } from "@/config/env";

const justSans = localFont({
  variable: "--font-ez-latin",
  display: "swap",
  src: [
    {
      path: "../fonts/brand/JUSTSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/brand/JUSTSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/brand/JUSTSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/brand/JUSTSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/brand/JUSTSans-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
});

const ibmPlexSansThai = localFont({
  variable: "--font-ez-thai",
  display: "swap",
  src: [
    {
      path: "../fonts/brand/IBMPlexSansThai-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/brand/IBMPlexSansThai-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/brand/IBMPlexSansThai-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/brand/IBMPlexSansThai-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appBaseUrl || "http://localhost:3103"),
  title: "EZQueue | Queue and Booking Platform",
  description:
    "EZQueue is the ultimate queue management, booking, CRM, and shop operations platform for modern businesses. Fast, secure, and easy to use.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = getHomepageLocale(cookieStore.get("locale")?.value);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${justSans.variable} ${ibmPlexSansThai.variable} nosic-homepage`}
      >
        <RouteLoadingProvider>{children}</RouteLoadingProvider>
      </body>
    </html>
  );
}
