/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/gamma/:path*', // Match any path starting with /api/gamma
        destination: 'https://gamma-api.polymarket.com/:path*', // Proxy to the actual API
      },
    ];
  },
};

module.exports = nextConfig; 