/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Commenté car incompatible avec les pages dynamiques utilisant "use client"

  images: {
    unoptimized: true, // 👉 évite les erreurs car l'optimisation d'images Next nécessite un serveur Node
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'api.usermanagement.ecoletestpro.com',
      },
    ],
  },
};

module.exports = nextConfig;
