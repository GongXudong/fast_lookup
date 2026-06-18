import type { Database } from 'sql.js'

export interface Question {
  id: number
  question: string
  answer: string
  created_at: string
  updated_at: string
}

export type SearchResult = Question & { score?: number }

// 相关性评分：精确匹配 100，开头匹配 80，包含匹配 60，否则 0（大小写不敏感）
export function scoreMatch(question: string, keyword: string): number {
  const q = question.toLowerCase()
  const k = keyword.toLowerCase()
  if (q === k) return 100
  if (q.startsWith(k)) return 80
  if (q.includes(k)) return 60
  return 0
}

export class QuestionRepository {
  constructor(private db: Database) {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  getAll(): Question[] {
    const stmt = this.db.prepare('SELECT * FROM questions ORDER BY updated_at DESC')
    const results: Question[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Question)
    }
    stmt.free()
    return results
  }

  search(keyword: string): SearchResult[] {
    if (!keyword.trim()) {
      return this.getAll()
    }

    const stmt = this.db.prepare('SELECT * FROM questions WHERE question LIKE ?')
    stmt.bind([`%${keyword}%`])
    const results: SearchResult[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as SearchResult
      row.score = scoreMatch(row.question, keyword)
      results.push(row)
    }
    stmt.free()

    results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    return results
  }

  create(question: string, answer: string): void {
    this.db.run('INSERT INTO questions (question, answer) VALUES (?, ?)', [question, answer])
  }

  update(id: number, question: string, answer: string): void {
    this.db.run(
      'UPDATE questions SET question = ?, answer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [question, answer, id]
    )
  }

  remove(id: number): void {
    this.db.run('DELETE FROM questions WHERE id = ?', [id])
  }

  deleteAll(): void {
    this.db.run('DELETE FROM questions')
  }
}
