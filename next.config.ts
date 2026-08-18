import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.19", "192.168.1.0/24", "192.168.1.15"],
};

export default nextConfig;

