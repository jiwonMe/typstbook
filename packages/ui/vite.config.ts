import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedDesignPlugin } from "@seed-design/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    seedDesignPlugin({
      colorMode: "system",
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "seed-design": path.join(root, "seed-design"),
    },
    conditions: ["seed-layered"],
  },
  server: {
    port: 4400,
    hmr: {
      path: "/vite-hmr",
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
