# Run Electron App

运行和验证 Electron + Vue 应用

## 适用场景

- 开发环境下运行应用
- 验证功能是否正常
- 测试热重载是否生效

## 命令

### 开发模式

```bash
npm run dev
```

这会启动 Vite 开发服务器并打开 Electron 窗口。

### 检查进程 (Windows)

```powershell
tasklist | findstr "electron vite"
```

### 停止进程 (Windows)

```powershell
taskkill /F /IM electron.exe
taskkill /F /IM node.exe
```

## 验证清单

- [ ] 应用窗口正常打开
- [ ] 题库列表显示正常
- [ ] 添加题目功能正常
- [ ] 搜索功能正常
- [ ] 数据持久化正常（重启后数据保留）
