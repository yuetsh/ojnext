import Vue from "@vitejs/plugin-vue"
import path from "path"
import AutoImport from "unplugin-auto-import/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const url = env.VITE_OJ_URL

  const proxyConfig = {
    target: url,
    changeOrigin: true,
    headers: { Referer: url },
  }
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            chart: ["vue-chartjs", "chart.js"],
            editor: [
              "@wangeditor-next/editor",
              "@wangeditor-next/editor-for-vue",
            ],
            cm: [
              "vue-codemirror",
              "codemirror",
              "@codemirror/lang-cpp",
              "@codemirror/lang-python",
            ],
            // md: [
            //   "md-editor-v3",
            //   "md-editor-v3/lib/style.css",
            //   "md-editor-v3/lib/preview.css",
            // ],
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
  }
})
