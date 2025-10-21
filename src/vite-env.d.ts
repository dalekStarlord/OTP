/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OTP_BASE: string
  readonly VITE_OTP_TRANS_GQL: string
  readonly VITE_OTP_GTFS_GQL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

