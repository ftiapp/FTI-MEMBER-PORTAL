/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "react-icons"],
  },

  serverExternalPackages: [
    "mssql",
    "tedious",
    "postmark",
    "tarn",
    "msnodesqlv8",
    "jsonwebtoken",
    "bcryptjs",
  ],

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },

  async redirects() {
    return [];
  },

  webpack: (config, { isServer, dev, webpack }) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "./");

    if (isServer) {
      // Mark these packages as external - don't bundle them
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        ({ request }, callback) => {
          if (/^(mssql|tedious|postmark|tarn|msnodesqlv8|jsonwebtoken|bcryptjs)$/.test(request)) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        path: false,
        os: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        util: false,
      };
    }

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              enforce: true,
            },
          },
        },
      };
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    if (!dev) {
      config.performance = {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
        hints: "warning",
      };
      config.devtool = false;
    }

    if (process.env.ANALYZE === "true") {
      const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
        }),
      );
    }

    return config;
  },

  output: "standalone",

  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;