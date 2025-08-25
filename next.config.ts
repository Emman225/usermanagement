import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['usermanagement-api.ecoletestpro.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'usermanagement-api.ecoletestpro.com',
        pathname: '/storage/profile_photos/**',
      },
    
    ],
  },
};

export default nextConfig;
