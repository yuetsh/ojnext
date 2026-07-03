import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv, type Plugin } from "vite"
import vue from "@vitejs/plugin-vue"
import legacy from "@vitejs/plugin-legacy"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

// index.html 里按需注入 MaxKB 脚本（原 Rsbuild EJS 模板的等价实现）
function injectMaxkb(maxkbUrl: string | undefined): Plugin {
  return {
    name: "inject-maxkb",
    transformIndexHtml(html) {
      if (!maxkbUrl) return html
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { async: true, defer: true, src: maxkbUrl },
            injectTo: "head",
          },
        ],
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "PUBLIC_")

  const proxyConfig = {
    target: env["PUBLIC_OJ_URL"],
    changeOrigin: true,
  }

  const wsProxyConfig = {
    target: env["PUBLIC_WS_URL"],
    ws: true,
    changeOrigin: true,
  }

  return {
    plugins: [
      vue(),
      // 机房存在 Chrome 91 等旧浏览器：不做 SystemJS 双构建，
      // 只按使用情况给现代产物注入 core-js API polyfill（Array.at 等）
      legacy({
        renderLegacyChunks: false,
        modernTargets: "chrome>=90",
        modernPolyfills: true,
      }),
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
      injectMaxkb(env["PUBLIC_MAXKB_URL"]),
    ],
    envPrefix: "PUBLIC_",
    resolve: {
      alias: {
        // mermaid-legacy (mermaid@9) 写死了 UMD 路径，新版 cytoscape 的 exports
        // 不允许 import 条件访问它，转到 ESM 产物
        "cytoscape/dist/cytoscape.umd.js": "cytoscape/dist/cytoscape.esm.mjs",
        utils: fileURLToPath(new URL("./src/utils", import.meta.url)),
        oj: fileURLToPath(new URL("./src/oj", import.meta.url)),
        admin: fileURLToPath(new URL("./src/admin", import.meta.url)),
        shared: fileURLToPath(new URL("./src/shared", import.meta.url)),
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
