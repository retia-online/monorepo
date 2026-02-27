/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@megamercado-vzla/auth',
        '@megamercado-vzla/api',
        '@megamercado-vzla/ui',
        '@megamercado-vzla/configs',
    ],
    serverExternalPackages: ['mongoose', 'pino', 'thread-stream'],
    turbopack: {
        root: '../../'
    }
}

module.exports = nextConfig
