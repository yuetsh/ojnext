import { defineConfig } from "vite"
import path from "path"
import Vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import Markdown from "vite-plugin-vue-markdown"
import Shiki from "markdown-it-shiki"

const url = "https://ojtest.hyyz.izhai.net"
const proxyConfig = {
  target: url,
  changeOrigin: true,
  headers: { Referer: url },
}

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      utils: path.resolve(__dirname, "./src/utils"),
      oj: path.resolve(__dirname, "./src/oj"),
      admin: path.resolve(__dirname, "./src/admin"),
      learn: path.resolve(__dirname, "./src/learn"),
    },
  },
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "@vueuse/core",
        "pinia",
        {
          "naive-ui": [
            "useDialog",
            "useMessage",
            "useNotification",
            "useLoadingBar",
          ],
        },
      ],
      dts: "./src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({ enabledCollections: ["ep"] }),
      ],
      dts: "./src/components.d.ts",
    }),
    Icons({ autoInstall: true }),
    Markdown({
      markdownItSetup(md) {
        md.use(Shiki, {
          highlightLines: true,
          theme: {
            dark: "vitesse-dark",
            light: "vitesse-light",
          },
        })
      },
    }),
  ],
  server: {
    proxy: {
      "/api": proxyConfig,
      "/public": proxyConfig,
    },
  },
})
