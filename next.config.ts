import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@circle-fin/developer-controlled-wallets": path.resolve(
        __dirname,
        "./lib/circle-stub.js"
      ),
      "@openfort/openfort-node": path.resolve(__dirname, "./lib/openfort-stub.js"),
    };
    return config;
  },
  experimental: {
    turbopack: {
      resolveAlias: {
        "@circle-fin/developer-controlled-wallets": "./lib/circle-stub.js",
        "@openfort/openfort-node": "./lib/openfort-stub.js",
      },
    },
  },
};

export default nextConfig;
