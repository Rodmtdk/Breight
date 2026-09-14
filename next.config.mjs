/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // indispensable pour GitHub Pages
  basePath: '/<nom-du-repo>', // remplace <nom-du-repo> par le nom exact du repo
  assetPrefix: '/<nom-du-repo>/',

  images: {
    unoptimized: true,        // obligatoire pour export statique
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
