import { describe, it, expect } from 'vitest'
import { highlightText } from '../src/utils/highlight'

describe('highlightText', () => {
  it('关键字为空时返回原文（仅转义）', () => {
    expect(highlightText('Vue 框架', '')).toBe('Vue 框架')
    expect(highlightText('Vue 框架', '   ')).toBe('Vue 框架')
  })

  it('包裹匹配片段为 highlight span', () => {
    expect(highlightText('学习Vue3框架', 'Vue3')).toBe(
      '学习<span class="highlight">Vue3</span>框架'
    )
  })

  it('大小写不敏感', () => {
    expect(highlightText('Learn VUE here', 'vue')).toBe(
      'Learn <span class="highlight">VUE</span> here'
    )
  })

  it('高亮所有出现的匹配', () => {
    expect(highlightText('aXaXa', 'X')).toBe(
      'a<span class="highlight">X</span>a<span class="highlight">X</span>a'
    )
  })

  it('对题干做 HTML 转义防止 XSS', () => {
    const result = highlightText('<img src=x onerror=alert(1)>', 'zzz')
    expect(result).toBe('&lt;img src=x onerror=alert(1)&gt;')
    expect(result).not.toContain('<img')
  })

  it('关键字含正则特殊字符不报错且能匹配', () => {
    expect(highlightText('价格是 (100)', '(100)')).toBe(
      '价格是 <span class="highlight">(100)</span>'
    )
    expect(highlightText('a.b.c', '.')).toContain('<span class="highlight">.</span>')
  })

  it('无匹配时返回转义后的原文，不含 highlight', () => {
    const result = highlightText('完全无关', 'xyz')
    expect(result).toBe('完全无关')
    expect(result).not.toContain('highlight')
  })
})
