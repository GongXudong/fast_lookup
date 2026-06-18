# Exam Question Quick Lookup System

English | [简体中文](./README.md)

A Windows desktop app for quickly searching and managing a question bank. It supports full CRUD on questions, real-time keyword search (with matched fragments highlighted in red), and batch import/export via Excel.

## Features

- **Quick Lookup**
  - Real-time keyword search; nothing is shown when the search box is empty
  - Matched fragments in the question text are **highlighted in red** (case-insensitive)
  - Results sorted by relevance; click a question to expand its answer
- **Question Management (CRUD)**
  - Create, edit, and delete questions
  - **Import from xls**: bulk-import two-column (question, answer) Excel data
  - **Export to xls**: export all questions to an `.xlsx` file
  - **Delete all questions**: guarded by a confirmation dialog to prevent accidents
- **Local storage**: uses SQLite (sql.js); data is saved in the user data directory and works fully offline

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron |
| Frontend | Vue 3 (`<script setup>`) |
| Build tool | Vite + vite-plugin-electron |
| Storage | SQLite (sql.js, WebAssembly) |
| Excel parsing | xlsx (SheetJS) |
| Testing | Vitest |
| Packaging | electron-builder |

## Search Relevance Scoring

| Rule | Score |
|------|-------|
| Exact match (question == keyword) | 100 |
| Prefix match (question starts with keyword) | 80 |
| Contains match (question includes keyword) | 60 |
| No match | 0 |

Results are sorted from highest to lowest score.

## Project Structure

```
fast_lookup/
├── electron/
│   ├── main.ts            # Main process: window, DB init, IPC, dialogs
│   ├── preload.ts         # Preload: exposes electronAPI to the renderer
│   ├── questionRepo.ts    # Question repository: CRUD + search scoring (testable)
│   └── xlsxHelpers.ts     # Excel import parsing / export building (testable)
├── src/
│   ├── App.vue            # Root component: sidebar nav + content area
│   ├── main.ts            # Vue entry
│   ├── components/
│   │   ├── SearchBox.vue       # Quick lookup (search box)
│   │   ├── QuestionList.vue     # Result list (highlight + expand answer)
│   │   └── QuestionForm.vue     # Management (CRUD + import/export/clear)
│   └── utils/
│       └── highlight.ts   # Keyword highlighting (HTML/regex escaping, testable)
├── tests/
│   ├── crud.test.ts       # Repository CRUD + search scoring tests
│   ├── xlsxHelpers.test.ts # Import/export logic tests
│   └── highlight.test.ts  # Highlighting logic tests
├── vite.config.ts         # Vite + Electron config
├── vitest.config.ts       # Test config (does not load the Electron plugin)
└── package.json
```

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| question | TEXT | Question text |
| answer | TEXT | Answer text |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## Getting Started

### Requirements

- Node.js 18+
- Windows (development and target platform)

### Install dependencies

```bash
npm install
```

> If the Electron binary download is slow or fails, use a mirror:
> ```bash
> ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ npm install
> ```

### Development (hot reload)

```bash
npm run dev
```

### Run tests

```bash
npm test           # run once
npm run test:watch # watch mode
```

### Build & package

```bash
npm run build      # build production version
npm run pack       # build a Windows installer (NSIS)
```

## Excel Import Format

The imported `.xls` / `.xlsx` file should contain two columns:

| Question | Answer |
|----------|--------|
| What is Vue3? | A progressive frontend framework |
| How to install deps? | npm install |

- Column 1 is the question, column 2 is the answer
- Header rows (题目/题干/问题 or question + 答案/answer) are skipped automatically
- Empty rows and rows missing a column are ignored

## Notes

- The database file is stored in the user data directory (`%APPDATA%`); uninstalling the app does not delete it automatically.
- The VS Code integrated terminal injects `ELECTRON_RUN_AS_NODE=1`, which makes Electron start in plain Node mode. This project removes that variable in `vite.config.ts`, so `npm run dev` works out of the box with no manual steps.
