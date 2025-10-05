import { defineConfig, loadEnv } from "@rsbuild/core"
import { pluginVue } from "@rsbuild/plugin-vue"
import AutoImport from "unplugin-auto-import/rspack"
import Components from "unplugin-vue-components/rspack"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

export default defineConfig(({ envMode }) => {
  const { publicVars, rawPublicVars } = loadEnv({
    cwd: process.cwd(),
    mode: envMode,
  })

  const url = rawPublicVars["PUBLIC_OJ_URL"]
  const proxyConfig = {
    target: url,
    headers: { Referer: url },
    changeOrigin: true,
  }
  return {
    plugins: [pluginVue()],
    tools: {
      rspack: {
        plugins: [
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
      },
    },
    html: {
      template: "./index.html",
    },
    source: {
      entry: {
        index: "./src/main.ts",
      },
      define: publicVars,
    },
    performance: {
      chunkSplit: {
        strategy: "split-by-module",
        override: {
          cacheGroups: {
            // 将大型编辑器库单独分包
            editor: {
              test: /[\\/]node_modules[\\/](codemirror|@codemirror|vue-codemirror|@wangeditor-next|md-editor-v3|y-codemirror\.next)[\\/]/,
              name: "vendor-editor",
              priority: 30,
            },
            // Chart.js 独立分包（包含 canvas-confetti）
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|vue-chartjs|@kurkle|canvas-confetti)[\\/]/,
              name: "vendor-charts",
              priority: 25,
            },
            // UI 框架（Naive UI 及其依赖）
            ui: {
              test: /[\\/]node_modules[\\/](naive-ui|@css-render|css-render|seemly|vooks|vueuc|treemate|vdirs|evtd)[\\/]/,
              name: "vendor-ui",
              priority: 20,
            },
            // Vue 生态
            vue: {
              test: /[\\/]node_modules[\\/](vue|vue-router|pinia|@vue|@vueuse)[\\/]/,
              name: "vendor-vue",
              priority: 15,
            },
            // 其他常用库
            common: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendor-common",
              priority: 10,
              minChunks: 2,
            },
          },
        },
      },
      // 移除 console.log（生产环境）
      removeConsole: ["log"],
    },
    resolve: {
      alias: {
        utils: "./src/utils",
        oj: "./src/oj",
        admin: "./src/admin",
        shared: "./src/shared",
      },
    },
    server: {
      port: 5173,
      proxy: {
        "/api": proxyConfig,
        "/public": proxyConfig,
      },
    },
  }
})
