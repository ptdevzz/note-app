/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cho phép build song song với dev server (vd: NEXT_DIST_DIR=.next-build next build)
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // youtubei.js là ESM thuần, để Node load trực tiếp thay vì bundle qua webpack
    serverComponentsExternalPackages: ['youtubei.js'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};

module.exports = nextConfig;
