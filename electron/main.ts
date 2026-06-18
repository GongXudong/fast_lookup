import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import type { Database } from 'sql.js'
import { QuestionRepository } from './questionRepo'
import { parseImportRows, buildExportData } from './xlsxHelpers'

const require = createRequire(import.meta.url)
const initSqlJs = require('sql.js')
const XLSX = require('xlsx')

let db: Database
let repo: QuestionRepository

function getDbPath() {
  return path.join(app.getPath('userData'), 'questions.db')
}

async function initDatabase() {
  // sql.js 加载 wasm 文件：定位到 node_modules 下的 sql-wasm.wasm
  const sqlJsDir = path.dirname(require.resolve('sql.js'))
  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(sqlJsDir, file),
  })
  const dbPath = getDbPath()

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  repo = new QuestionRepository(db)
  saveDatabase()
}

function saveDatabase() {
  const data = db.export()
  fs.writeFileSync(getDbPath(), Buffer.from(data))
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  mainWindow = win

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// 原生对话框关闭后，主动把焦点还给窗口，避免输入框失焦无法输入
function refocusMain() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus()
    mainWindow.webContents.focus()
  }
}

app.whenReady().then(async () => {
  await initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('db:getAll', () => {
  return repo.getAll()
})

ipcMain.handle('db:search', (_, keyword: string) => {
  return repo.search(keyword)
})

ipcMain.handle('db:create', (_, question: string, answer: string) => {
  repo.create(question, answer)
  saveDatabase()
  return { success: true }
})

ipcMain.handle('db:update', (_, id: number, question: string, answer: string) => {
  repo.update(id, question, answer)
  saveDatabase()
  return { success: true }
})

ipcMain.handle('db:delete', (_, id: number) => {
  repo.remove(id)
  saveDatabase()
  return { success: true }
})

async function showMessage(
  type: 'info' | 'warning' | 'error',
  message: string,
  detail?: string
) {
  if (!mainWindow || mainWindow.isDestroyed()) return
  await dialog.showMessageBox(mainWindow, {
    type,
    message,
    detail,
    buttons: ['确定'],
    noLink: true,
  })
}

ipcMain.handle('db:importXls', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    title: '选择 xls 文件',
    properties: ['openFile'],
    filters: [{ name: 'Excel 文件', extensions: ['xls', 'xlsx'] }],
  })

  if (canceled || filePaths.length === 0) {
    refocusMain()
    return { success: false, canceled: true, imported: 0 }
  }

  try {
    const buffer = fs.readFileSync(filePaths[0])
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false })

    const items = parseImportRows(rows)
    for (const item of items) {
      repo.create(item.question, item.answer)
    }
    const imported = items.length

    if (imported > 0) saveDatabase()
    await showMessage('info', `成功导入 ${imported} 条题目`)
    refocusMain()
    return { success: true, imported }
  } catch (err: any) {
    await showMessage('error', '导入失败', err?.message)
    refocusMain()
    return { success: false, error: err?.message || '导入失败' }
  }
})

ipcMain.handle('db:exportXls', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow!, {
    title: '导出题目至 xls 文件',
    defaultPath: 'questions.xlsx',
    filters: [{ name: 'Excel 文件', extensions: ['xlsx'] }],
  })

  if (canceled || !filePath) {
    refocusMain()
    return { success: false, canceled: true, exported: 0 }
  }

  try {
    const data = buildExportData(repo.getAll())

    const sheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, sheet, '题目')
    XLSX.writeFile(workbook, filePath)

    await showMessage('info', `成功导出 ${data.length - 1} 条题目`)
    refocusMain()
    return { success: true, exported: data.length - 1 }
  } catch (err: any) {
    await showMessage('error', '导出失败', err?.message)
    refocusMain()
    return { success: false, error: err?.message || '导出失败' }
  }
})

ipcMain.handle('db:deleteAll', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { success: false }

  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: '确认删除',
    message: '确定要删除所有题目吗？',
    detail: '此操作不可恢复！',
    buttons: ['取消', '确定删除'],
    defaultId: 0,
    cancelId: 0,
    noLink: true,
  })

  if (response !== 1) {
    refocusMain()
    return { success: false, canceled: true }
  }

  repo.deleteAll()
  saveDatabase()
  refocusMain()
  return { success: true }
})
