import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['api.usermanagement.ecoletestpro.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.usermanagement.ecoletestpro.com',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
