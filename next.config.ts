import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['192.168.5.195', 'usermanagement-api.ecoletestpro.com'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "usermanagement-api.ecoletestpro.com",
        pathname: "/storage/**", // ✅ autorise tous les fichiers sous /storage/
      },
      {
        protocol: 'https',
        hostname: 'usermanagement-api.ecoletestpro.com',
        pathname: '/storage/profile_photos/**',
      },
    ],
  },
};

export default nextConfig;
