import { defineConfig } from 'vite';
import fs from 'fs-extra';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      fileName: 'impmal-pl',
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
    // Custom plugin to copy module.json
    {
      name: 'copy-module-json',
      closeBundle: async () => {
        await fs.copy('src/module.json', 'dist/module.json');
      },
    },
  ],
});
