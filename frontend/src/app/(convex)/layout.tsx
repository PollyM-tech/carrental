import type { ReactNode } from "react";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/auth/ConvexClientProvider";

export default function ConvexLayout({ children }: { children: ReactNode }) {
  return <ConvexAuthNextjsServerProvider storageNamespace={`movara-session-v2-${process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}`}><ConvexClientProvider>{children}</ConvexClientProvider></ConvexAuthNextjsServerProvider>;
}
