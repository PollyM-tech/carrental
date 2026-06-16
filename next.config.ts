import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
