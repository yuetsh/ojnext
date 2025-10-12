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
      },
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
