await import("./src/env.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        canvas: "commonjs canvas",
      });
    }

    return config;
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ["bullmq"],
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
