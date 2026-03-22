/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@retia-global/auth',
        '@retia-global/api',
        '@retia-global/ui',
        '@retia-global/configs',
    ],
    serverExternalPackages: ['mongoose', 'pino', 'thread-stream'],
    turbopack: {
        root: '../../',
        resolveAlias: {
            // Force single React instance across monorepo
            'react': './node_modules/react',
            'react-dom': './node_modules/react-dom',
            'react/jsx-runtime': './node_modules/react/jsx-runtime',
            'react/jsx-dev-runtime': './node_modules/react/jsx-dev-runtime',
        },
    }
}

module.exports = nextConfig
