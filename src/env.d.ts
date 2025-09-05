/// <reference types="@rsbuild/core/types" />

interface ImportMetaEnv {
  readonly PUBLIC_MAXKB_URL: string
  readonly PUBLIC_OJ_URL: string
  readonly PUBLIC_CODE_URL: string
  readonly PUBLIC_JUDGE0_URL: string
  readonly PUBLIC_ICONIFY_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
