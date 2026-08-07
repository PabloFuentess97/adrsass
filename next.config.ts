import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./public/fonts/noto-sans/**/*", "./node_modules/pdfkit/js/data/**/*"],
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
