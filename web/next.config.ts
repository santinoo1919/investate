import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
      include: /node_modules/,
    });
    return config;
  },
};

export default nextConfig;
