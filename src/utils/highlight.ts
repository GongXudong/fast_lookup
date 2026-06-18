function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 把题干中与关键字匹配的片段用 <span class="highlight"> 包裹（大小写不敏感）。
// 题干先做 HTML 转义防止 XSS，关键字做正则转义防止特殊字符报错。
export function highlightText(text: string, keyword: string): string {
  const safeText = escapeHtml(text)
  const kw = keyword.trim()
  if (!kw) return safeText

  const regex = new RegExp(`(${escapeRegExp(escapeHtml(kw))})`, 'gi')
  return safeText.replace(regex, '<span class="highlight">$1</span>')
}
