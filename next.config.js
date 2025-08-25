/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'http',
        hostname: '192.168.5.195',
        port: '8283',
      },
      {
        protocol: 'https',
        hostname: 'usermanagement-api.ecoletestpro.com',
      },
    ],
  },
};

module.exports = nextConfig;
