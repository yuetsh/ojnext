/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAXKB_URL: string
  readonly VITE_OJ_URL: string
  readonly VITE_CODE_URL: string
  readonly VITE_JUDGE0_URL: string
  readonly VITE_ICONIFY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
