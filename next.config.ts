import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      if (config.resolve) {
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
        };
      } else {
        config.resolve = {
          fallback: { fs: false },
        };
      }
    }
    return config;
  },
};

export default nextConfig;
