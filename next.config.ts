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
};

export default nextConfig;