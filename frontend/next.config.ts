import type { NextConfig } from "next";

const convexHostname = process.env.NEXT_PUBLIC_CONVEX_URL ? new URL(process.env.NEXT_PUBLIC_CONVEX_URL).hostname : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),

  images: {
    qualities: [75, 85, 90],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }, ...(convexHostname ? [{ protocol: "https" as const, hostname: convexHostname, pathname: "/api/storage/**" }] : [])],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
