import { describe, it, expect } from 'vitest'
import { parseImportRows, buildExportData } from '../electron/xlsxHelpers'

describe('parseImportRows', () => {
  it('依据表头定位列，并跳过表头行', () => {
    const rows = [
      ['题目', '答案'],
      ['什么是Vue3', '渐进式前端框架'],
      ['如何安装依赖', 'npm install'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: '什么是Vue3', answer: '渐进式前端框架' },
      { question: '如何安装依赖', answer: 'npm install' },
    ])
  })

  it('识别表头变体（题干/问题/question，大小写不敏感）', () => {
    expect(parseImportRows([['题干', '答案'], ['Q1', 'A1']])).toEqual([
      { question: 'Q1', answer: 'A1' },
    ])
    expect(parseImportRows([['问题', '答案'], ['Q1', 'A1']])).toHaveLength(1)
    expect(parseImportRows([['question', 'answer'], ['Q1', 'A1']])).toHaveLength(1)
    expect(parseImportRows([['QUESTION', 'ANSWER'], ['Q1', 'A1']])).toHaveLength(1)
  })

  it('表头列顺序颠倒时按表头取对应列', () => {
    const rows = [
      ['答案', '题目'],
      ['A1', 'Q1'],
      ['A2', 'Q2'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ])
  })

  it('题目/答案列不在前两列时也能正确定位', () => {
    const rows = [
      ['序号', '答案', '题目'],
      ['1', 'A1', 'Q1'],
      ['2', 'A2', 'Q2'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ])
  })

  it('表头存在时跳过题目或答案为空的行', () => {
    const rows = [
      ['题目', '答案'],
      ['有题无答', ''],
      ['', '有答无题'],
      ['  ', '   '],
      [],
      ['完整', '完整答案'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: '完整', answer: '完整答案' },
    ])
  })

  it('去除首尾空白', () => {
    expect(parseImportRows([['题目', '答案'], ['  Q  ', '  A  ']])).toEqual([
      { question: 'Q', answer: 'A' },
    ])
  })

  it('数字单元格转为字符串', () => {
    expect(parseImportRows([['题目', '答案'], [123, 456]])).toEqual([
      { question: '123', answer: '456' },
    ])
  })

  it('无表头时回退为第1列题目、第2列答案（不跳过首行）', () => {
    const rows = [
      ['什么是Vue3', '渐进式前端框架'],
      ['如何安装依赖', 'npm install'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: '什么是Vue3', answer: '渐进式前端框架' },
      { question: '如何安装依赖', answer: 'npm install' },
    ])
  })

  it('空输入返回空数组', () => {
    expect(parseImportRows([])).toEqual([])
  })
})

describe('buildExportData', () => {
  it('首行为表头，其余为数据行', () => {
    const data = buildExportData([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ])
    expect(data).toEqual([
      ['题目', '答案'],
      ['Q1', 'A1'],
      ['Q2', 'A2'],
    ])
  })

  it('空列表时只有表头', () => {
    expect(buildExportData([])).toEqual([['题目', '答案']])
  })

  it('与 parseImportRows 往返一致', () => {
    const items = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ]
    const exported = buildExportData(items)
    // 导出的数据再作为导入解析（含表头），应还原出原始题目
    expect(parseImportRows(exported)).toEqual(items)
  })
})
