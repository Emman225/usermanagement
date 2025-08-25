import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["usermanagement-api.ecoletestpro.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "usermanagement-api.ecoletestpro.com",
        pathname: "/storage/**", // ✅ autorise tous les fichiers sous /storage/
      },
    ],
  },
};

export default nextConfig;
