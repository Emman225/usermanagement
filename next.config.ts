import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['https://usermanagement-api.ecoletestpro.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'https://usermanagement-api.ecoletestpro.com',
        port: '8080',
        pathname: '/storage/profile_photos/**',
      },
    
    ],
  },
};

export default nextConfig;
