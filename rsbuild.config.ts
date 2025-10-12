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

  const proxyConfig = {
    target: rawPublicVars["PUBLIC_OJ_URL"],
    changeOrigin: true,
  }

  const wsProxyConfig = {
    target: rawPublicVars["PUBLIC_WS_URL"],
    ws: true,
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
            // ===== 核心框架层 (100+) =====
            // Vue 生态 - 框架基础，最高优先级
            vue: {
              test: /[\\/]node_modules[\\/](vue|vue-router|pinia|@vue|@vueuse)[\\/]/,
              name: "vendor-vue",
              priority: 100,
            },
            // ===== UI 层 (90+) =====
            // Naive UI 及其依赖 - 核心 UI 框架
            ui: {
              test: /[\\/]node_modules[\\/](naive-ui|@css-render|css-render|seemly|vooks|vueuc|treemate|vdirs|evtd)[\\/]/,
              name: "vendor-ui",
              priority: 90,
            },
            // ===== 编辑器层 (70-80) =====
            // CodeMirror - 代码编辑器（使用最频繁）
            editor: {
              test: /[\\/]node_modules[\\/](codemirror|@codemirror|vue-codemirror|y-codemirror\.next)[\\/]/,
              name: "vendor-editor",
              priority: 80,
            },
            // Markdown 编辑器
            mdeditor: {
              test: /[\\/]node_modules[\\/]md-editor-v3[\\/]/,
              name: "vendor-mdeditor",
              priority: 75,
            },
            // WangEditor - 富文本编辑器
            wangeditor: {
              test: /[\\/]node_modules[\\/]@wangeditor-next[\\/]/,
              name: "vendor-wangeditor",
              priority: 70,
            },
            // ===== 功能库层 (50-60) =====
            // Chart.js - 图表库（按需加载）
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|vue-chartjs|@kurkle|canvas-confetti)[\\/]/,
              name: "vendor-charts",
              priority: 60,
            },
            // Mermaid - 流程图库（按需加载）
            mermaid: {
              test: /[\\/]node_modules[\\/]mermaid[\\/]/,
              name: "vendor-mermaid",
              priority: 55,
            },
            // ===== 通用层 (10) =====
            // 其他常用库 - 兜底分组
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
        "/ws": wsProxyConfig,
      },
    },
  }
})
