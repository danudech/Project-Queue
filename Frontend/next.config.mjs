import nextIntl from 'next-intl/plugin';

const withNextIntl = nextIntl('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    '127.0.0.1',
    '127.0.0.1:3000',
    '127.0.0.1:3198',
    'localhost',
    'localhost:3000',
    'localhost:3198',
    '26.225.63.158',
    '26.225.63.158:3000',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '26.225.63.158',
        port: '5001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
