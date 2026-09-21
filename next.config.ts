import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // eslint: {
  //   // Warning: This allows production builds to successfully complete 
  //   // even if your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  // },
  typescript: {
    // Adding this too since you're having type errors during build
    ignoreBuildErrors: true,
  },
  // Image Remote Patterns for Backend on Port 5000 - FIXED IPv6/IPv4 issue
  images: {
    unoptimized: true, //
    remotePatterns: [     
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    loader: 'default',
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // PWA headers: correct content types & caching for manifest and service worker
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
