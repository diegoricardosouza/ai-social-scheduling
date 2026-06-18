import type { NextConfig } from "next";
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  allowedDevOrigins: [
    "unleash-legible-winner.ngrok-free.dev"
  ]
};

export default withNextIntl('./i18n/request.ts')(nextConfig);
