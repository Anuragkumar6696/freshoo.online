import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
        className="antialiased bg-white text-gray-900 font-sans max-w-full overflow-x-hidden min-h-screen relative"
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
