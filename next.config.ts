import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.usernames.app-backend.toolsforhumanity.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'worldcoin.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'world.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
