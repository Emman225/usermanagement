/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "usermanagement-api.ecoletestpro.com",
        pathname: "/storage/**", // ✅ autorise tous les fichiers dans /storage/
      },
    ],
  },
};

module.exports = nextConfig;

