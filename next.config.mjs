/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // ✅ alias ile tamamen devre dışı bırak
    config.resolve.alias = {
      ...config.resolve.alias,
      "@circle-fin/developer-controlled-wallets": false,
      "@openfort/openfort-node": false,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    // fallback sadece Node built-in'ler için
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
