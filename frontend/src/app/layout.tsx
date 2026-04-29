import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { AppThemeProvider } from "@/infrastructure/theme/AppThemeProvider";
import { getLocale } from "next-intl/server";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DentiFlow - Dental Clinic Operations",
  description: "Comprehensive SaaS platform for dental clinic operations",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Derive direction from locale; "ar" uses RTL, all others use LTR
  const locale = await getLocale();
  const direction: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang="en"
      dir={direction}
      className={`${publicSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppThemeProvider direction={direction}>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
