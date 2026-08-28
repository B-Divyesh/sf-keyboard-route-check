import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'site',
  publicDir: '../public',
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      input: {
        index: resolve('site/index.html'),
        demo: resolve('site/demo.html'),
        privacy: resolve('site/privacy.html'),
        terms: resolve('site/terms.html'),
        notFound: resolve('site/404.html')
      }
    }
  }
});
