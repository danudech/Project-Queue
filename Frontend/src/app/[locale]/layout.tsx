import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./theme.css"
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
const inter = Inter({ subsets: ["latin"] });
// language 
import { getLangDir } from 'rtl-detect';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import DirectionProvider from "@/providers/direction-provider";

export const metadata: Metadata = {
  title: "EZQueue User Dashboard",
  description: "EZQueue queue, booking, and shop operation dashboard.",
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
      <body className={`${inter.className} dashcode-app`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class"
            defaultTheme="light">
            <MountedProvider>
              <DirectionProvider direction={direction}>
                {children}
              </DirectionProvider>
            </MountedProvider>
            <Toaster />
            <SonnerToaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
