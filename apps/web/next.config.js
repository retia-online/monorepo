/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@megamercado/auth', '@megamercado/api', '@megamercado/ui', '@megamercado/configs'],
    serverExternalPackages: ['mongoose', 'pino', 'thread-stream'],
}

module.exports = nextConfig
