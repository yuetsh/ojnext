import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const url = "https://oj.hyyz.izhai.net";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: url,
        changeOrigin: true,
        headers: {
          Referer: url,
        },
      },
      "/public": {
        target: url,
        changeOrigin: true,
        headers: {
          Referer: url,
        },
      },
    },
  },
});
