/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOX_API_KEY: string
  readonly VITE_VOX_FLOW_GUID: string
  readonly VITE_VOX_COMPANY_NAME?: string
  readonly VITE_VOX_COMPANY_LOGO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
