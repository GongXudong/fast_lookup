# Init Electron Vue Project

初始化 Electron + Vue 3 项目，使用 Vite 作为构建工具。

## 适用场景

- 首次创建项目
- 需要快速搭建 Electron + Vue 开发环境
- 项目初始化阶段

## 操作步骤

### 1. 初始化 Vue + Vite 项目

```bash
npm create vite@latest . -- --template vue-ts
```

### 2. 安装 Electron 相关依赖

```bash
npm install electron electron-builder vite-plugin-electron vite-plugin-electron-renderer better-sqlite3
npm install -D @types/better-sqlite3
```

### 3. 配置 Vite (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['better-sqlite3']
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

### 4. 创建 Electron 主进程 (electron/main.ts)

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'

let db: Database.Database

function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'questions.db')
  db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()
})

// IPC handlers for CRUD operations
ipcMain.handle('db:getAll', () => db.prepare('SELECT * FROM questions ORDER BY updated_at DESC').all())
ipcMain.handle('db:add', (_, question: string, answer: string) => {
  const stmt = db.prepare('INSERT INTO questions (question, answer) VALUES (?, ?)')
  return stmt.run(question, answer)
})
ipcMain.handle('db:update', (_, id: number, question: string, answer: string) => {
  const stmt = db.prepare('UPDATE questions SET question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  return stmt.run(question, answer, id)
})
ipcMain.handle('db:delete', (_, id: number) => {
  const stmt = db.prepare('DELETE FROM questions WHERE id = ?')
  return stmt.run(id)
})
```

### 5. 创建预加载脚本 (electron/preload.ts)

```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getQuestions: () => ipcRenderer.invoke('db:getAll'),
  addQuestion: (question: string, answer: string) => ipcRenderer.invoke('db:add', question, answer),
  updateQuestion: (id: number, question: string, answer: string) => ipcRenderer.invoke('db:update', id, question, answer),
  deleteQuestion: (id: number) => ipcRenderer.invoke('db:delete', id)
})
```

### 6. 更新 package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "vite",
    "electron:build": "npm run build && electron-builder",
    "pack": "npm run build && electron-builder --dir"
  }
}
```

## 验证

运行 `npm run dev` 确保项目正常启动。
