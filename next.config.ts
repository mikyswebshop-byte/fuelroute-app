import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostnames allowed to hit the Next.js dev server (HTTP/HTTPS LAN + local)
  allowedDevOrigins: ["192.168.1.104", "localhost", "127.0.0.1"],
};

export default nextConfig;
