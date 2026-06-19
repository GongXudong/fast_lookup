export interface ImportedQuestion {
  question: string
  answer: string
}

const QUESTION_HEADER = /^(题目|题干|问题|question)$/i
const ANSWER_HEADER = /^(答案|answer)$/i

function cell(value: any): string {
  return value == null ? '' : String(value).trim()
}

// 把 xls 解析出的二维数组转成题目列表：
// 依据首行表头定位“题目”列与“答案”列（列顺序、位置任意），从第 2 行起按这两列取值，跳过表头行本身；
// 跳过题目或答案为空的行，去除首尾空白。
// 若首行未能同时识别出“题目”列和“答案”列，则回退为第 1 列题目、第 2 列答案（不跳过首行）。
export function parseImportRows(rows: any[][]): ImportedQuestion[] {
  const result: ImportedQuestion[] = []
  if (!rows || rows.length === 0) return result

  // 解析首行表头，定位题目列与答案列的下标
  const header = rows[0] || []
  let qCol = -1
  let aCol = -1
  for (let i = 0; i < header.length; i++) {
    const text = cell(header[i])
    if (qCol === -1 && QUESTION_HEADER.test(text)) qCol = i
    else if (aCol === -1 && ANSWER_HEADER.test(text)) aCol = i
  }

  if (qCol !== -1 && aCol !== -1) {
    // 识别到表头：用表头定位的列取值，并跳过首行（表头本身）
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r] || []
      const question = cell(row[qCol])
      const answer = cell(row[aCol])
      if (!question || !answer) continue
      result.push({ question, answer })
    }
    return result
  }

  // 未识别到表头：回退为第 1 列题目、第 2 列答案
  for (const row of rows) {
    const question = cell(row?.[0])
    const answer = cell(row?.[1])
    if (!question || !answer) continue
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
