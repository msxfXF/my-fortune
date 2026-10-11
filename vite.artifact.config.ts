import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/** 打成单个 HTML 文件（JS/CSS 全部内联），用于发布为 claude.ai Artifact 等单文件托管 */
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-single',
    chunkSizeWarningLimit: 2000,
  },
});
