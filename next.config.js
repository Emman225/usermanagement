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
        hostname: 'https://usermanagement-api.ecoletestpro.com',
        port: '8080',
      },
    ],
  },
};

module.exports = nextConfig;
