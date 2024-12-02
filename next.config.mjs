import MillionLint from "@million/lint";
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
        // "@sparticuz/chromium": "commonjs @sparticuz/chromium",
      });
    }

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
};

export default MillionLint.next({
  enabled: true,
  rsc: true
})(nextConfig);
