import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Freshoo | Fresh Meat & Seafood Delivered Fast",
  description: "Freshoo delivers fresh chicken, mutton, fish, and eggs. Cleaned, freshly cut after your order, hygienically packed, and delivered at market prices with zero delivery charges in Rohini Sector 22 & Saket.",
  keywords: "fresh meat, chicken home delivery, fresh fish delhi, order mutton online, eggs delivery saket, fresh cut chicken rohini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} antialiased bg-white text-gray-900 font-sans`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
