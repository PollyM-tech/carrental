import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    qualities: [75, 90],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
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
