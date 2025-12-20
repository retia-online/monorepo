/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@retia/database', '@retia/types', '@retia/utils', '@retia/ui'],
    serverExternalPackages: ['mongoose'],
}

module.exports = nextConfig
