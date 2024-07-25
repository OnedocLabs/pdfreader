import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
});
