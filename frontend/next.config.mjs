/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output → lean production Docker image.
  output: 'standalone',
};

export default nextConfig;
