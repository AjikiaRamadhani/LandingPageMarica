import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.19", "192.168.1.0/24", "192.168.1.15"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xadqkozewyeqxwbtyjdo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;