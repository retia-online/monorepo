import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.tsx'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'react-native', 'react-native-web'],
    injectStyle: true,
    minify: false,
    treeshake: true,
    banner: {
        js: '"use client";',
    },
});