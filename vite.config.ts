import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [react(), svgr()],
  css: {
    postcss: './postcss.config.js',
  },
  base: "./",
  build: {
    outDir: "dist/renderer",
    rollupOptions: {
      input: resolve(__dirname, "src/index.html")
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || 'http://localhost:3000/api'),
  }
};
});
