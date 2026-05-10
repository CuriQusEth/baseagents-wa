import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: "c5f59cfa3fe2f73752eaf98d9ba0dbe8",
    RECEIPT_SECRET: "CAydUlxPpLymtJYIerIGNnvtzKJmCWMmZavfyzi/qp8="
  },
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
        };
        // @react-native-async-storage/async-storage can be ignored this way
        config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    }
    return config;
  },
};

export default nextConfig;
