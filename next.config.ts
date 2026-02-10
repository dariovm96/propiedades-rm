import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
