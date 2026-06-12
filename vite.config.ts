/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' を使うことで、GitHub Pages のサブパス（/<repo名>/）配信でも
// リポジトリ名を埋め込まずに動作する。ルーティングは HashRouter を使用。
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
