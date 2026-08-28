import type { Metadata } from "next";
import { Outfit, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
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
        className={`${outfit.variable} ${inter.variable} ${playfair.variable} antialiased bg-white text-gray-900 font-sans`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
