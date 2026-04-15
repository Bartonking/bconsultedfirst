import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@google-cloud/tasks", "@google-cloud/aiplatform"],
  outputFileTracingIncludes: {
    "/api/**/*": [
      "./node_modules/@google-cloud/tasks/build/protos/**/*",
      "./node_modules/@google-cloud/aiplatform/build/protos/**/*",
    ],
  },
};

export default nextConfig;
