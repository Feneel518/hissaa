"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter } from "next/navigation";

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if we are running in a native environment
    const setupDeepLinking = async () => {
      App.addListener("appUrlOpen", (event: any) => {
        // Example URL: hissaa://callback?token=...
        // We want to extract the path and query params
        const url = new URL(event.url);
        const path = url.pathname || "";
        const search = url.search || "";
        
        // Navigate internally within Next.js
        router.push(`${path}${search}`);
      });
    };

    setupDeepLinking();

    return () => {
      App.removeAllListeners();
    };
  }, [router]);

  return <>{children}</>;
}
