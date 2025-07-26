import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow data URLs (base64 images) by using unoptimized for data URLs
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // For base64 images, we'll handle them differently in components
    domains: [],
  },
};

export default nextConfig;
