// src/proxy.ts
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware();

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth-test/:path*",
    "/workos-test/:path*",
  ],
};