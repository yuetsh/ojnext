import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv, type Plugin } from "vite"
import vue from "@vitejs/plugin-vue"
import legacy from "@vitejs/plugin-legacy"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"

// 显式保留 Chrome 90 所需的运行时兼容项，避免 plugin-legacy 对每个产物执行 Babel 扫描。
// 升级前端依赖后需要重新审计此列表。
const polyfills = [
  "es.aggregate-error.cause",
  "es.array-buffer.detached",
  "es.array-buffer.transfer-to-fixed-length",
  "es.array-buffer.transfer",
  "es.array.at",
  "es.array.find-last-index",
  "es.array.push",
  "es.array.to-reversed",
  "es.array.to-sorted",
  "es.array.to-spliced",
  "es.array.with",
  "es.error.cause",
  "es.iterator.constructor",
  "es.iterator.drop",
  "es.iterator.every",
  "es.iterator.filter",
  "es.iterator.find",
  "es.iterator.flat-map",
  "es.iterator.for-each",
  "es.iterator.map",
  "es.iterator.reduce",
  "es.iterator.some",
  "es.iterator.to-array",
  "es.json.parse",
  "es.json.stringify",
  "es.map.get-or-insert-computed",
  "es.map.get-or-insert",
  "es.object.has-own",
  "es.regexp.flags",
  "es.set.difference.v2",
  "es.set.intersection.v2",
  "es.set.is-disjoint-from.v2",
  "es.set.is-subset-of.v2",
  "es.set.is-superset-of.v2",
  "es.set.symmetric-difference.v2",
  "es.set.union.v2",
  "es.string.at-alternative",
  "es.typed-array.at",
  "es.typed-array.find-last-index",
  "es.typed-array.find-last",
  "es.typed-array.set",
  "es.typed-array.to-reversed",
  "es.typed-array.to-sorted",
  "es.typed-array.with",
  "es.uint8-array.set-from-base64",
  "es.uint8-array.set-from-hex",
  "es.uint8-array.to-base64",
  "es.uint8-array.to-hex",
  "es.weak-map.get-or-insert-computed",
  "es.weak-map.get-or-insert",
  "esnext.array.group",
  "web.dom-exception.stack",
  "web.immediate",
  "web.structured-clone",
  "web.url-search-params.delete",
  "web.url-search-params.has",
  "web.url-search-params.size",
  "web.url.can-parse",
]

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
        modernPolyfills: polyfills,
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
