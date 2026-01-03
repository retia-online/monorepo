/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@megamercado/auth', '@megamercado/api', '@megamercado/ui', '@megamercado/configs'],
    serverExternalPackages: ['mongoose', 'pino', 'thread-stream'],
    turbopack: {
        root: '../../'
    }
}

module.exports = nextConfig
