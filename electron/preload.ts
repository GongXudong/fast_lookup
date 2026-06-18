import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAll: () => ipcRenderer.invoke('db:getAll'),
  search: (keyword: string) => ipcRenderer.invoke('db:search', keyword),
  create: (question: string, answer: string) => ipcRenderer.invoke('db:create', question, answer),
  update: (id: number, question: string, answer: string) => ipcRenderer.invoke('db:update', id, question, answer),
  delete: (id: number) => ipcRenderer.invoke('db:delete', id),
  importXls: () => ipcRenderer.invoke('db:importXls'),
  exportXls: () => ipcRenderer.invoke('db:exportXls'),
  deleteAll: () => ipcRenderer.invoke('db:deleteAll'),
})
