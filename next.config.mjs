/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "ideal-kangaroo-879.convex.cloud"
      }
    ]
  }
};

export default nextConfig;
