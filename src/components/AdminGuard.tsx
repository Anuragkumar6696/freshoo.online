"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoadingBackend } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingBackend && (!user || !user.isAdmin)) {
      router.push("/account");
    }
  }, [user, isLoadingBackend, router]);

  if (isLoadingBackend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-semibold">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return <>{children}</>;
}
