/// <reference types="vite/client" />

interface ElectronAPI {
  getAll: () => Promise<any[]>
  search: (keyword: string) => Promise<any[]>
  create: (question: string, answer: string) => Promise<any>
  update: (id: number, question: string, answer: string) => Promise<any>
  delete: (id: number) => Promise<any>
  importXls: () => Promise<{ success: boolean; imported?: number; canceled?: boolean; error?: string }>
  exportXls: () => Promise<{ success: boolean; exported?: number; canceled?: boolean; error?: string }>
  deleteAll: () => Promise<any>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
