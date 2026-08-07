import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/export/pdf": ["./node_modules/pdfkit/js/data/**/*"],
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
