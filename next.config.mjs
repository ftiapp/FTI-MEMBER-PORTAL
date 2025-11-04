/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "./");

    // Handle mysql2 module compatibility
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        mysql2: "commonjs mysql2",
        "mysql2/promise": "commonjs mysql2/promise",
      });
    }

    // Ensure proper module resolution
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
