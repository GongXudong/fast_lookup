import { describe, it, expect } from 'vitest'
import { parseImportRows, buildExportData } from '../electron/xlsxHelpers'

describe('parseImportRows', () => {
  it('解析正常的两列数据', () => {
    const rows = [
      ['什么是Vue3', '渐进式前端框架'],
      ['如何安装依赖', 'npm install'],
    ]
    expect(parseImportRows(rows)).toEqual([
      { question: '什么是Vue3', answer: '渐进式前端框架' },
      { question: '如何安装依赖', answer: 'npm install' },
    ])
  })

  it('跳过表头行（题目/答案 及其变体）', () => {
    expect(parseImportRows([['题目', '答案'], ['Q1', 'A1']])).toEqual([
      { question: 'Q1', answer: 'A1' },
    ])
    expect(parseImportRows([['题干', '答案'], ['Q1', 'A1']])).toHaveLength(1)
    expect(parseImportRows([['question', 'answer'], ['Q1', 'A1']])).toHaveLength(1)
    expect(parseImportRows([['QUESTION', 'ANSWER'], ['Q1', 'A1']])).toHaveLength(1)
  })

  it('不会把普通数据误判为表头', () => {
    // “题目”作为答案、或只有一列匹配，不应跳过
    expect(parseImportRows([['题目是什么', '答案']])).toEqual([
      { question: '题目是什么', answer: '答案' },
    ])
  })

  it('跳过空行与缺列的行', () => {
    const rows = [
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
    expect(parseImportRows([['  Q  ', '  A  ']])).toEqual([
      { question: 'Q', answer: 'A' },
    ])
  })

  it('数字单元格转为字符串', () => {
    expect(parseImportRows([[123, 456]])).toEqual([
      { question: '123', answer: '456' },
    ])
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
