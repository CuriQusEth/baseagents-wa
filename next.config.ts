import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@circle-fin/developer-controlled-wallets": path.resolve(
        __dirname,
        "./lib/circle-stub.js"
      ),
      "@openfort/openfort-node": path.resolve(__dirname, "./lib/openfort-stub.js"),
    };
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            "@react-native-async-storage/async-storage": false,
        };
    }
    return config;
  },
};

export default nextConfig;
