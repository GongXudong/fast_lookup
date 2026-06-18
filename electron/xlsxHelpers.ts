export interface ImportedQuestion {
  question: string
  answer: string
}

// 把 xls 解析出的二维数组转成题目列表：
// 第 1 列为题目，第 2 列为答案；跳过空行/缺列，跳过表头行（题目/题干/问题 + 答案/answer），去除首尾空白。
export function parseImportRows(rows: any[][]): ImportedQuestion[] {
  const result: ImportedQuestion[] = []
  for (const row of rows) {
    const question = row?.[0] == null ? '' : String(row[0]).trim()
    const answer = row?.[1] == null ? '' : String(row[1]).trim()
    if (!question || !answer) continue
    if (/^(题目|题干|问题|question)$/i.test(question) && /^(答案|answer)$/i.test(answer)) {
      continue
    }
    result.push({ question, answer })
  }
  return result
}

// 构建导出用的二维数组：首行为表头，其余每行一条题目和答案。
export function buildExportData(questions: ImportedQuestion[]): string[][] {
  const data: string[][] = [['题目', '答案']]
  for (const q of questions) {
    data.push([q.question, q.answer])
  }
  return data
}
