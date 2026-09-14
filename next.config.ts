import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages serves the site as static HTML, CSS, JavaScript, and
  // public assets. The app has no server-only routes or runtime data.
  output: "export",
};

export default nextConfig;
