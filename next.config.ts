import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/home',
        destination: '/root/home',
      },
      {
        source: '/summary',
        destination: '/root/summary',
      },
      {
        source: '/login',
        destination: '/root/login',
      },
      {
        source: '/signup',
        destination: '/root/signup',
      },
      {
        source: '/loading',
        destination: '/root/loading',
      },
    ];
  },
};

export default nextConfig;
