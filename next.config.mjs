// import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

// // Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// // (when running the application with `next dev`), for more information see:
// // https://github.com/cloudflare/next-on-pages/blob/main/internal-packages/next-dev/README.md
// if (process.env.NODE_ENV === "development") {
//   await setupDevPlatform();
// }

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
