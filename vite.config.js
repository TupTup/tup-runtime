import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'index.js',
      name: 'TupRuntime',
      fileName: 'tup-runtime',
      cssFileName: 'tup-runtime',
      formats: ['es']
    }
  }
});
