import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
    },
    emptyOutDir: true,
  },
  plugins: [],
});
