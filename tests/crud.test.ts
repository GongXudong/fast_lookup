import { describe, it, expect, beforeEach } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { QuestionRepository, scoreMatch } from '../electron/questionRepo'

const require = createRequire(import.meta.url)
const initSqlJs = require('sql.js')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createRepo() {
  const sqlJsDir = path.dirname(require.resolve('sql.js'))
  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(sqlJsDir, file),
  })
  const db = new SQL.Database()
  return new QuestionRepository(db)
}

describe('scoreMatch（相关性评分）', () => {
  it('精确匹配 100 分', () => {
    expect(scoreMatch('Vue', 'Vue')).toBe(100)
  })
  it('开头匹配 80 分', () => {
    expect(scoreMatch('Vue 框架', 'Vue')).toBe(80)
  })
  it('包含匹配 60 分', () => {
    expect(scoreMatch('学习 Vue', 'Vue')).toBe(60)
  })
  it('不匹配 0 分', () => {
    expect(scoreMatch('React', 'Vue')).toBe(0)
  })
  it('大小写不敏感', () => {
    expect(scoreMatch('VUE', 'vue')).toBe(100)
  })
})

describe('QuestionRepository CRUD', () => {
  let repo: QuestionRepository

  beforeEach(async () => {
    repo = await createRepo()
  })

  it('初始为空', () => {
    expect(repo.getAll()).toEqual([])
  })

  it('创建并读取题目', () => {
    repo.create('问题1', '答案1')
    const all = repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].question).toBe('问题1')
    expect(all[0].answer).toBe('答案1')
    expect(all[0].id).toBeTypeOf('number')
  })

  it('更新题目', () => {
    repo.create('原题', '原答案')
    const id = repo.getAll()[0].id
    repo.update(id, '新题', '新答案')
    const row = repo.getAll().find((q) => q.id === id)!
    expect(row.question).toBe('新题')
    expect(row.answer).toBe('新答案')
  })

  it('删除单条题目', () => {
    repo.create('Q1', 'A1')
    repo.create('Q2', 'A2')
    const id = repo.getAll()[0].id
    repo.remove(id)
    const all = repo.getAll()
    expect(all).toHaveLength(1)
    expect(all.find((q) => q.id === id)).toBeUndefined()
  })

  it('删除所有题目', () => {
    repo.create('Q1', 'A1')
    repo.create('Q2', 'A2')
    repo.deleteAll()
    expect(repo.getAll()).toEqual([])
  })
})

describe('QuestionRepository.search（搜索）', () => {
  let repo: QuestionRepository

  beforeEach(async () => {
    repo = await createRepo()
    repo.create('Vue', '精确')
    repo.create('Vue 是什么', '开头')
    repo.create('学习 Vue 框架', '包含')
    repo.create('React 教程', '无关')
  })

  it('空关键字返回全部', () => {
    expect(repo.search('')).toHaveLength(4)
    expect(repo.search('   ')).toHaveLength(4)
  })

  it('只返回包含关键字的题目', () => {
    const results = repo.search('Vue')
    expect(results).toHaveLength(3)
    expect(results.every((r) => r.question.includes('Vue'))).toBe(true)
  })

  it('按相关性从高到低排序（精确 > 开头 > 包含）', () => {
    const results = repo.search('Vue')
    expect(results.map((r) => r.score)).toEqual([100, 80, 60])
    expect(results[0].question).toBe('Vue')
    expect(results[1].question).toBe('Vue 是什么')
    expect(results[2].question).toBe('学习 Vue 框架')
  })

  it('无匹配返回空数组', () => {
    expect(repo.search('Angular')).toEqual([])
  })

  it('搜索大小写不敏感', () => {
    expect(repo.search('vue')).toHaveLength(3)
  })
})
