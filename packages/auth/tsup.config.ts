import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Generate TypeScript declarations
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['next', 'react', 'next-auth', '@mretia-global/api'],
  treeshake: true,
  minify: false,
  target: 'es2020',
});