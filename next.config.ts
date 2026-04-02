import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.100.6:3000"],
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
