import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-900 font-sans">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl font-black text-brand-primary mb-4">404</span>
        <h1 className="text-2xl font-black text-stone-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-stone-500 max-w-md mb-6">
          The meat cut, page, or order you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-brand-primary hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
        >
          Return to Freshoo Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}

