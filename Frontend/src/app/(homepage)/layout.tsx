import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { getHomepageLocale } from "./i18n";

const cotaSans = localFont({
  variable: "--font-homepage-latin",
  display: "swap",
  src: [
    { path: "./fonts/cota-sans/TBJCotaSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cota-sans/TBJCotaSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cota-sans/TBJCotaSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cota-sans/TBJCotaSans-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/cota-sans/TBJCotaSans-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
});
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-homepage-thai",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EZQueue | Queue and Booking Platform",
  description: "EZQueue is the ultimate queue management, booking, CRM, and shop operations platform for modern businesses. Fast, secure, and easy to use.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
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
      <body className={`${cotaSans.variable} ${notoSansThai.variable} nosic-homepage`}>
        {children}
      </body>
    </html>
  );
}
