import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/home',
        destination: '/root/home',
      },
      {
        source: '/members',
        destination: '/root/members',
      },
      {
        source: '/gallery',
        destination: '/root/gallery',
      },
      {
        source: '/what-we-do',
        destination: '/root/what-we-do',
      },
      {
        source: '/apply',
        destination: '/root/apply',
      },
    ];
  },
};

export default nextConfig;
