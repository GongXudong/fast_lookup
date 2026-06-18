# 题目速查系统

[English](./README.en.md) | 简体中文

一个用于快速查询和管理题库的 Windows 桌面应用：支持题目的增删改查、关键字实时检索（匹配片段标红）、以及 Excel 批量导入/导出。

## 功能特性

- **题目速查**
  - 实时关键字检索，搜索框为空时不显示任何结果
  - 题干中与关键字匹配的片段**标红**高亮（大小写不敏感）
  - 按相关性排序，单击题干展开对应答案
- **题目管理（CRUD）**
  - 新增、编辑、删除题目
  - **从 xls 文件导入**：批量导入两列（题目、答案）的 Excel 数据
  - **导出题目至 xls 文件**：将全部题目导出为 `.xlsx`
  - **删除所有题目**：带二次确认对话框，防止误删
- **本地存储**：使用 SQLite（sql.js），数据保存在用户数据目录，离线可用

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron |
| 前端框架 | Vue 3（`<script setup>`） |
| 构建工具 | Vite + vite-plugin-electron |
| 数据存储 | SQLite（sql.js，WebAssembly） |
| Excel 解析 | xlsx (SheetJS) |
| 测试框架 | Vitest |
| 打包工具 | electron-builder |

## 搜索相关性评分

| 规则 | 分值 |
|------|------|
| 精确匹配（题干 == 关键字） | 100 |
| 开头匹配（题干以关键字开头） | 80 |
| 包含匹配（题干包含关键字） | 60 |
| 不匹配 | 0 |

结果按分值从高到低排序。

## 项目结构

```
fast_lookup/
├── electron/
│   ├── main.ts            # 主进程：窗口、数据库初始化、IPC、对话框
│   ├── preload.ts         # 预加载脚本：向渲染进程暴露 electronAPI
│   ├── questionRepo.ts    # 题目仓储：CRUD + 搜索评分（可测试）
│   └── xlsxHelpers.ts     # Excel 导入解析 / 导出构建（可测试）
├── src/
│   ├── App.vue            # 根组件：左侧导航 + 内容区
│   ├── main.ts            # Vue 入口
│   ├── components/
│   │   ├── SearchBox.vue       # 题目速查（搜索框）
│   │   ├── QuestionList.vue     # 结果列表（高亮 + 展开答案）
│   │   └── QuestionForm.vue     # 题目管理（CRUD + 导入/导出/清空）
│   └── utils/
│       └── highlight.ts   # 关键字高亮（HTML/正则转义，可测试）
├── tests/
│   ├── crud.test.ts       # 仓储 CRUD + 搜索评分测试
│   ├── xlsxHelpers.test.ts # 导入/导出逻辑测试
│   └── highlight.test.ts  # 高亮逻辑测试
├── vite.config.ts         # Vite + Electron 配置
├── vitest.config.ts       # 测试配置（不加载 Electron 插件）
└── package.json
```

## 数据模型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| question | TEXT | 题干内容 |
| answer | TEXT | 答案内容 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 快速开始

### 环境要求

- Node.js 18+
- Windows（开发与目标平台）

### 安装依赖

```bash
npm install
```

> 若 Electron 二进制下载缓慢或失败，可使用国内镜像：
> ```bash
> ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install
> ```

### 开发模式（热重载）

```bash
npm run dev
```

### 运行测试

```bash
npm test          # 运行一次
npm run test:watch # 监听模式
```

### 构建与打包

```bash
npm run build     # 构建生产版本
npm run pack      # 打包 Windows 安装包（NSIS）
```

## Excel 导入格式

导入的 `.xls` / `.xlsx` 文件应包含两列：

| 题目 | 答案 |
|------|------|
| 什么是 Vue3？ | 渐进式前端框架 |
| 如何安装依赖？ | npm install |

- 第 1 列为题目，第 2 列为答案
- 表头行（题目/题干/问题 + 答案）会被自动跳过
- 空行、缺列的行会被忽略

## 说明

- 数据库文件保存在用户数据目录（`%APPDATA%`）下，卸载应用不会自动删除。
- VS Code 集成终端会注入 `ELECTRON_RUN_AS_NODE=1`，导致 Electron 以纯 Node 模式启动。本项目已在 `vite.config.ts` 中删除该变量，因此 `npm run dev` 可直接运行，无需手动处理。
