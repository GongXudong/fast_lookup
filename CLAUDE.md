# 题目抽查系统 (Exam Review System)

## 项目概述

**项目名称**: 题目抽查系统
**项目类型**: Windows 桌面应用
**核心功能**: 题库管理与快速查询系统，支持题目的增删改查和关键字搜索
**目标用户**: 需要应对上级电话抽查的工作人员

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Electron + Vue 3 | 跨平台桌面应用 |
| 构建工具 | Vite | 快速的开发构建工具 |
| 数据存储 | SQLite (sql.js) | 本地轻量级数据库 |
| 打包工具 | electron-builder | Windows 安装包生成 |
| 开发环境 | Windows | 开发环境 |

## 功能需求

### 1. 题库管理 (CRUD)

- **创建题目**: 添加新题目和对应答案
- **读取题目**: 查看题目列表和详情
- **更新题目**: 编辑题目和答案内容
- **删除题目**: 删除不需要的题目

### 2. 快速查询功能

- **搜索框**: 文本输入框，实时响应
- **筛选逻辑**: 根据关键字过滤题干
- **相关性排序**: 按匹配程度排序结果
- **结果展示**: 列表形式展示，单击展开答案

## 项目结构

```
d:\code\fast_lookup\
├── electron/
│   ├── main.ts              # Electron 主进程 + SQLite IPC
│   └── preload.ts           # 预加载脚本
├── src/
│   ├── App.vue              # 根组件
│   ├── main.ts              # Vue 入口
│   ├── components/
│   │   ├── QuestionList.vue    # 题目列表
│   │   ├── QuestionForm.vue    # 题目表单（新增/编辑）
│   │   └── SearchBox.vue       # 搜索框
│   ├── sql.js.d.ts          # sql.js 类型声明
│   └── vite-env.d.ts        # Vue 全局类型声明
├── tests/
│   └── crud.test.ts         # CRUD 单元测试
├── package.json
├── vite.config.ts
├── tsconfig.json
└── CLAUDE.md
```

## 数据模型

### Question (题目)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| question | TEXT | 题干内容 |
| answer | TEXT | 答案内容 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 搜索引擎算法

相关性评分规则:
1. **精确匹配**: 题干完全包含关键字 = 100分
2. **开头匹配**: 题干开头包含关键字 = 80分
3. **包含匹配**: 题干中间包含关键字 = 60分
4. **多关键字**: 多个关键字同时匹配时累加分数

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# 运行单元测试
npx ts-node tests/crud.test.ts

# 构建生产版本
npm run build

# 打包 Windows 安装包
npm run pack
```

## 注意事项

- 开发环境为 Windows
- 数据库文件存储在用户数据目录下 (`%APPDATA%`)
- 直接运行 `.exe` 文件即可启动应用
