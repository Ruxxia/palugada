import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart({
    server: { entry: "src/server.ts" },
  }), react(), cloudflare({
    viteEnvironment: {
      name: "ssr"
    }
  })],
});