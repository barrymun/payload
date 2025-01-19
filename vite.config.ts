/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(version),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["/tests/setup.ts"],
    coverage: {
      provider: "v8",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {},
      },
    },
  },
});
