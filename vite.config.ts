import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import Markdown from "vite-plugin-vue-markdown"

const url = "https://ojtest.hyyz.izhai.net"
const proxyConfig = {
  target: url,
  changeOrigin: true,
  headers: { Referer: url },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core", "pinia"],
      resolvers: [ElementPlusResolver(), IconsResolver()],
      dts: "./src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({ enabledCollections: ["ep"] }),
      ],
      dts: "./src/components.d.ts",
    }),
    Icons({ autoInstall: true }),
    Markdown(),
  ],
  server: {
    proxy: {
      "/api": proxyConfig,
      "/public": proxyConfig,
    },
  },
})
