import legacy from "@vitejs/plugin-legacy"
import Vue from "@vitejs/plugin-vue"
import path from "path"
import AutoImport from "unplugin-auto-import/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig } from "vite"

const dev = process.env.NODE_ENV === "development"
const url = dev ? "https://ojtest.xuyue.cc" : "https://oj.xuyue.cc"
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
    Vue(),
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
