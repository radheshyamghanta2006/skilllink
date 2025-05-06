/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Completely disable source maps in production to avoid possible length errors
  productionBrowserSourceMaps: false,
  // Disable React strict mode which can lead to issues with undefined arrays during development
  reactStrictMode: false,
  // Disable webpack source maps entirely
  webpack: (config, { isServer, dev }) => {
    // Disable source maps in production
    if (!dev) {
      config.devtool = false;
      
      // Disable source maps for minimized files
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions.sourceMap = false;
          }
        });
      }
    }
    return config;
  },
}

export default nextConfig
