import nextIntl from 'next-intl/plugin';

// ระบุ path ของไฟล์ request.ts ที่เราสร้างในข้อ 1
const withNextIntl = nextIntl('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
