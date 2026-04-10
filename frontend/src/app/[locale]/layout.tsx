import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {AppThemeProvider} from "@/infrastructure/theme/AppThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentiFlow - Dental Clinic Operations",
  description: "Comprehensive SaaS platform for dental clinic operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hardcoded direction for now; could be loaded from cookie or route parameters
  const direction = "ltr";

  return (
    <html
      lang="en"
      dir={direction}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppThemeProvider direction={direction}>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
