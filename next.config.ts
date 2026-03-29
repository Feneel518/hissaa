import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Required for Static Export to 'out' folder
  images: {
    unoptimized: true, // Necessary for native apps
  },
  serverExternalPackages: ["@node-rs/argon2"],
};

export default nextConfig;
