import { defineConfig } from "vite"
import path from "path"
import Vue from "@vitejs/plugin-vue"
import legacy from "@vitejs/plugin-legacy"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import Markdown from "unplugin-vue-markdown/vite"
import Shiki from "markdown-it-shiki"

const url = "https://oj.hyyz.izhai.net"
const proxyConfig = {
  target: url,
  changeOrigin: true,
  headers: { Referer: url },
}

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          fancy: ["highlight.js", "canvas-confetti"],
          chart: ["vue-chartjs", "chart.js"],
          editor: ["@wangeditor/editor"],
          codemirror: [
            "vue-codemirror",
            "codemirror",
            "@codemirror/autocomplete",
            "@codemirror/commands",
            "@codemirror/language",
            "@codemirror/lint",
            "@codemirror/search",
            "@codemirror/state",
            "@codemirror/view",
          ],
          "codemirror-lang": [
            "@codemirror/lang-cpp",
            "@codemirror/lang-python",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      utils: path.resolve(__dirname, "./src/utils"),
      oj: path.resolve(__dirname, "./src/oj"),
      admin: path.resolve(__dirname, "./src/admin"),
    },
  },
  plugins: [
    Vue({ include: [/\.vue$/, /\.md$/] }),
    legacy({ targets: ["chrome 66", "not IE 11"] }),
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
        {
          from: "naive-ui",
          imports: [
            "DataTableColumn",
            "FormRules",
            "FormItemRule",
            "SelectOption",
            "UploadCustomRequestOptions",
            "UploadFileInfo",
            "MenuOption",
            "DropdownDividerOption",
            "DropdownOption",
          ],
          type: true,
        },
      ],
      dts: "./src/auto-imports.d.ts",
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: "./src/components.d.ts",
    }),
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
