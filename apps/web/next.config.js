/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@retia/database', '@retia/types', '@retia/utils', '@retia/ui'],
    experimental: {
        serverComponentsExternalPackages: ['mongoose'],
    },
}

module.exports = nextConfig
