/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
    },
    webpack(config, { dev }) {
        if (dev) {
            // Prevent stale .next/server chunk-map reuse that can trigger missing chunk modules in dev.
            config.cache = false;
        }
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
