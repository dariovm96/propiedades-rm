import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/headers";

const isProduction = process.env.NODE_ENV === "production";
const globalSecurityHeaders = getSecurityHeaders({
  isProduction,
  requestProtocol: isProduction ? "https" : "http",
});

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.100.6:3000"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(globalSecurityHeaders).map(([key, value]) => ({ key, value })),
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rzvayefzuqjgjvnlecqd.supabase.co",
      },
    ],
  },
};

export default nextConfig;
