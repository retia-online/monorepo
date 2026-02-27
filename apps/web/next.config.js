/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@megamercado-vzla/auth',
        '@megamercado-vzla/api',
        '@megamercado-vzla/ui',
        '@megamercado-vzla/configs',
    ],
    serverExternalPackages: ['mongoose', 'pino', 'thread-stream'],

    // Apunta los paquetes UI al source TypeScript directamente para que
    // Next.js respete los "use client" y evite duplicar React.
    webpack: (config) => {
        config.resolve.alias['@megamercado-vzla/ui'] = path.resolve(
            __dirname,
            '../../packages/ui/src/index.tsx'
        );
        return config;
    },
}

module.exports = nextConfig
