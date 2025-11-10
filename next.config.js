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
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
    // Remove React prop types in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Static optimization
  generateEtags: true,

  // Image optimization
  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirects for SEO and performance
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev, webpack }) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "./");

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

    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks for better caching
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

      // Minimize bundle size
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Performance budgets
    if (!dev) {
      config.performance = {
        maxEntrypointSize: 512000, // 512KB
        maxAssetSize: 512000, // 512KB
        hints: "warning",
      };
    }

    // Ignore source maps in production
    if (!dev) {
      config.devtool = false;
    }

    // Bundle analyzer
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

  // Experimental features for better performance

  // Output configuration
  output: "standalone",

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
