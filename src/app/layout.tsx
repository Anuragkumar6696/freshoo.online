import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
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
    <html lang="en" className="scroll-smooth max-w-full overflow-x-hidden">
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} ${playfair.variable} antialiased bg-white text-gray-900 font-sans max-w-full overflow-x-hidden min-h-screen relative`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
