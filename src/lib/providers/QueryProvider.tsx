"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Setup Persistence
    if (typeof window !== "undefined") {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
      });

      persistQueryClient({
        queryClient,
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      });

      setIsReady(true);
    }

    // Network Sync Listener
    const syncOnNetworkChange = async () => {
      const status = await Network.getStatus();
      if (status.connected) {
        toast.info("Network restored. Syncing data...");
        queryClient.resumePausedMutations();
        queryClient.invalidateQueries();
      } else {
        toast.warning("You are currently offline. Changes will sync later.");
      }
    };

    Network.addListener("networkStatusChange", syncOnNetworkChange);

    return () => {
      Network.removeAllListeners();
    };
  }, []);

  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
