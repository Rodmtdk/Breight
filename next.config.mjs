/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the default server build so App Router route handlers and Vercel Cron work.
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self)",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
