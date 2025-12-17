const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// Set the project root
config.projectRoot = projectRoot;

// Add support for path aliases and workspace packages
config.resolver.extraNodeModules = {
    '@': path.resolve(projectRoot, 'src'),
    '@retia/types': path.resolve(workspaceRoot, 'packages/types'),
    '@retia/utils': path.resolve(workspaceRoot, 'packages/utils'),
    '@retia/ui': path.resolve(workspaceRoot, 'packages/ui'),
    '@retia/database': path.resolve(workspaceRoot, 'packages/database'),
};

module.exports = config;