import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./theme.css";
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
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
// language
import { getLangDir } from "rtl-detect";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import DirectionProvider from "@/providers/direction-provider";
import RouteLoadingProvider from "@/providers/route-loading.provider";
import "@/styles/route-loading.css";
import { env } from "@/config/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.appBaseUrl || "http://localhost:3103"),
  title: "EZQueue User Dashboard",
  description: "EZQueue queue, booking, and shop operation dashboard.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await getMessages();
  const direction = getLangDir(locale);
  setRequestLocale(locale);
  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${justSans.variable} ${ibmPlexSansThai.variable} dashcode-app`}
      >
        <RouteLoadingProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="light">
              <MountedProvider>
                <DirectionProvider direction={direction}>
                  {children}
                </DirectionProvider>
              </MountedProvider>
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </RouteLoadingProvider>
      </body>
    </html>
  );
}
