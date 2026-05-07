import path from "node:path"
import { defineConfig, loadEnv } from "@rsbuild/core"
import { pluginVue } from "@rsbuild/plugin-vue"
import AutoImport from "unplugin-auto-import/rspack"
import Components from "unplugin-vue-components/rspack"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

const config: ReturnType<typeof defineConfig> = defineConfig(({ envMode }) => {
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
    output: {
      target: "web",
      polyfill: "usage",
    },
    resolve: {
      alias: {
        utils: "./src/utils",
        oj: "./src/oj",
        admin: "./src/admin",
        shared: "./src/shared",
        // 强制 @wangeditor-next/editor 所有导入（ESM/CJS）走同一个文件
        // 避免 Rspack v2 按 exports conditions 分别解析 .mjs/.js 产生双实例
        "@wangeditor-next/editor$": path.resolve(
          "./node_modules/@wangeditor-next/editor/dist/index.js"
        ),
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

export default config
