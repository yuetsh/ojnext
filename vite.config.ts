import { defineConfig } from "vite"
import path from "path"
import Vue from "@vitejs/plugin-vue"
import legacy from "@vitejs/plugin-legacy"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

const isTest = false
const url = isTest ? "https://ojtest.hyyz.izhai.net" : "https://oj.xuyue.cc"
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
          chart: ["vue-chartjs", "chart.js"],
          editor: ["@wangeditor/editor"],
          codemirror: [
            "vue-codemirror",
            "codemirror",
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
  ],
  server: {
    proxy: {
      "/api": proxyConfig,
      "/public": proxyConfig,
    },
  },
})
