import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

function copyRuntimeImages() {
  return {
    name: 'copy-runtime-images',
    closeBundle() {
      const source = resolve(process.cwd(), 'images');
      const target = resolve(process.cwd(), 'dist/images');

      if (!existsSync(source)) {
        return;
      }

      rmSync(target, { recursive: true, force: true });
      cpSync(source, target, { recursive: true });
    }
  };
}

export default defineConfig({
  plugins: [copyRuntimeImages()],
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
