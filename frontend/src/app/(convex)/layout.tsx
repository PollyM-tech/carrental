import type { ReactNode } from "react";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/auth/ConvexClientProvider";

export default function ConvexLayout({ children }: { children: ReactNode }) {
  return <ConvexAuthNextjsServerProvider><ConvexClientProvider>{children}</ConvexClientProvider></ConvexAuthNextjsServerProvider>;
}
