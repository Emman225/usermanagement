import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['192.168.5.195', 'usermanagement-api.ecoletestpro.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.5.195',
        port: '8283',
        pathname: '/storage/profile_photos/**',
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
