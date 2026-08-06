import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudflare R2 (via custom domain or r2.dev domain)
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
        search: "",
      },
      // Allow custom R2 public domain (configure via R2_PUBLIC_DOMAIN env)
      // Replace the hostname below with your actual R2 public domain
      // {
      //   protocol: "https",
      //   hostname: "media.yourdomain.com",
      //   pathname: "/**",
      //   search: "",
      // },
    ],
  },
  experimental: {
    // Allow large original images (e.g. 8-11MB phone photos) to reach the
    // /api/upload route handler intact so sharp can optimize them before they
    // are written to R2. The default of 10MB would silently truncate such
    // uploads. This only buffers when proxy is in use.
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;