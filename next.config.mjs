/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["recharts"],
  experimental: {
    // serverActions is enabled by default in Next 14
  },
};

export default nextConfig;
