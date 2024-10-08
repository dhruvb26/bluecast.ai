await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
        "chrome-aws-lambda": "commonjs chrome-aws-lambda",
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

export default nextConfig;
