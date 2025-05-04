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
  // Disable source maps for node modules to prevent 404 errors
  webpack: (config, { isServer }) => {
    // Disable source maps for node_modules
    if (!isServer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.sourceMap = false;
        }
      });
    }
    return config;
  },
}

export default nextConfig
