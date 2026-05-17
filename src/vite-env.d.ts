/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOX_API_KEY: string
  readonly VITE_VOX_FLOW_GUID?: string
  /** Override Dashboard API base (default: prod URL; in dev use Vite proxy path). */
  readonly VITE_VOX_DASHBOARD_API_BASE?: string
  readonly VITE_VOX_COMPANY_NAME?: string
  readonly VITE_VOX_COMPANY_LOGO?: string
  /** Comma-separated widget library groups to show: voice, messaging, rcs, tools, control */
  readonly VITE_VOX_FLOW_LIBRARY_GROUPS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
