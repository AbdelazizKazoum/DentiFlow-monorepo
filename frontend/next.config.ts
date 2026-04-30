import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin(
  "./src/infrastructure/i18n/config.ts",
);

// Both turbopack.root and outputFileTracingRoot must match.
// Point to the monorepo root so Turbopack can resolve all workspace packages.
const monorepoRoot = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
  images: {
    domains: ["i.pravatar.cc"],
  },
};

export default withNextIntl(nextConfig);
