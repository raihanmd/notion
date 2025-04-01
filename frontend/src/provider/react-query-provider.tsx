"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Provider } from "jotai";
import dynamic from "next/dynamic";
import {
  useState,
  type ReactNode,
  useEffect,
  Suspense,
  type PropsWithChildren,
} from "react";
import { queryClientAtom } from "jotai-tanstack-query";
import { useHydrateAtoms } from "jotai/react/utils";

export const queryClientConfig = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

const ReactQueryDevtoolsProduction = dynamic(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

const HydrateAtoms = ({ children }: PropsWithChildren) => {
  useHydrateAtoms([[queryClientAtom, queryClientConfig]]);
  return children;
};

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(queryClientConfig);
  const [showDevtools, setShowDevtools] = useState<boolean>(false);

  useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools((old) => !old);
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Provider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
      <ReactQueryDevtools />
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
    </PersistQueryClientProvider>
  );
};
