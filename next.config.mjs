/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  agentRules: false,
  async redirects() {
    return [
      {
        source: "/projects/team-blog-platform",
        destination: "/projects/knowledge-atlas",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
