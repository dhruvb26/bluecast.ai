import MillionLint from "@million/lint";
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    return config;
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      "bullmq",
      "puppeteer-extra",
      "puppeteer-extra-plugin-stealth",
    ],
    esmExternals: "loose",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  reactStrictMode: false,
};

export default MillionLint.next({
  enabled: true,
  rsc: true,
})(nextConfig);
