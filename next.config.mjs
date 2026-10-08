/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the default server build so App Router route handlers and Vercel Cron work.
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
