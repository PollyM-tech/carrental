import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gregarious-rooster-215.eu-west-1.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Server",
            value: "",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
