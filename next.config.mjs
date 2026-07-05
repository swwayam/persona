/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "hitesh.ai" },
      { protocol: "https", hostname: "www.piyushgarg.dev" }
    ]
  }
};

export default nextConfig;
