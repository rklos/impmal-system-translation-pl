import { defineConfig } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { injectPatches } from './.vite/load-patches';
import toolsConfig from './tools.config';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      fileName: toolsConfig.vite.output,
      formats: [ 'es' ],
    },
    minify: false,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-module-json',
      closeBundle: async () => {
        await fs.copy('src/module.json', 'dist/module.json');
      },
    },
    injectPatches(),
  ],
});
