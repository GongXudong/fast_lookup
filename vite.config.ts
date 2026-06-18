import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// VS Code 集成终端会注入 ELECTRON_RUN_AS_NODE=1，导致 Electron 以纯 Node 模式启动，
// 使 require('electron') 返回 exe 路径字符串而非 API（app 为 undefined）。
// vite.config 运行在派生 Electron 子进程的同一 Node 进程中，在此删除该变量即可让子进程不再继承。
// 注意：Electron 判断的是该变量"是否存在"，而非其值，因此必须 delete，置空/置 0 无效。
delete process.env.ELECTRON_RUN_AS_NODE

export default defineConfig({
  server: {
    watch: {
      // 忽略 Excel 文件及其临时锁文件（~$*），避免被打开锁定的 xls 让文件监听器 EBUSY 崩溃
      ignored: ['**/*.xls', '**/*.xlsx', '**/~$*'],
    },
  },
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['sql.js', 'xlsx'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
})
