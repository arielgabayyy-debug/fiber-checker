/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://nitukbeclick.co.il https://*.nitukbeclick.co.il *" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}
module.exports = nextConfig