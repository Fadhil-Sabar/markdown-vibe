import MarkdownIt from 'markdown-it'
// @ts-expect-error no types for markdown-it-task-lists
import taskLists from 'markdown-it-task-lists'

// Base markdown-it instance (no syntax highlighting or KaTeX by default — both lazy-loaded)
export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})

md.use(taskLists, { enabled: true, label: true, labelAfter: false })

// Detect if content likely has math so we can lazy-load KaTeX
export function hasMath(content: string): boolean {
  return content.includes('$')
}

// Detect if content has fenced code blocks for lazy-loading highlight.js
export function hasCode(content: string): boolean {
  return content.includes('```') || content.includes('~~~')
}

let hlLoaded = false
let katexLoaded = false

// Lazy-load highlight.js and patch the md instance
export async function ensureHighlightjs(): Promise<void> {
  if (hlLoaded) return
  const hljs = (await import('highlight.js')).default
  md.set({
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return (
            '<pre class="hljs"><code>' +
            hljs.highlight(code, { language: lang, ignoreIllegals: true }).value +
            '</code></pre>'
          )
        } catch {}
      }
      return (
        '<pre class="hljs"><code>' + md.utils.escapeHtml(code) + '</code></pre>'
      )
    },
  })
  hlLoaded = true
}

// Lazy-load KaTeX and markdown-it-katex plugin
export async function ensureKatex(): Promise<void> {
  if (katexLoaded) return
  // markdown-it-katex doesn't have great types; use dynamic import
  // We implement inline/block KaTeX rendering ourselves via custom rules
  // since markdown-it-katex has limited TypeScript support
  const katex = await import('katex')

  // Add inline math rule: $...$
  md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
    const src = state.src
    const pos = state.pos
    if (src[pos] !== '$') return false
    // Don't match $$ at inline level (block math)
    if (src[pos + 1] === '$') return false
    const end = src.indexOf('$', pos + 1)
    if (end === -1 || end === pos + 1) return false
    if (!silent) {
      const token = state.push('math_inline', 'math', 0)
      token.markup = '$'
      token.content = src.slice(pos + 1, end)
    }
    state.pos = end + 1
    return true
  })

  // Add block math rule: $$...$$
  md.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    let pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (pos + 2 > max) return false
    if (state.src[pos] !== '$' || state.src[pos + 1] !== '$') return false
    if (silent) return true

    pos += 2
    let nextLine = startLine
    let found = false
    // Check if closing $$ is on same line
    if (state.src.slice(pos, max).trimEnd().endsWith('$$')) {
      found = true
      nextLine = startLine
    } else {
      while (++nextLine < endLine) {
        pos = state.bMarks[nextLine] + state.tShift[nextLine]
        const lineMax = state.eMarks[nextLine]
        const lineStr = state.src.slice(pos, lineMax)
        if (lineStr.trimStart().startsWith('$$')) {
          found = true
          break
        }
      }
    }
    if (!found) return false

    const startPos = state.bMarks[startLine] + state.tShift[startLine] + 2
    const endPos = state.bMarks[nextLine] + state.tShift[nextLine]
    const rawContent = state.src.slice(startPos, endPos)
    const content = rawContent.replace(/\$\$$/, '').trim()

    const token = state.push('math_block', 'math', 0)
    token.block = true
    token.markup = '$$'
    token.content = content
    token.map = [startLine, nextLine]

    state.line = nextLine + 1
    return true
  })

  // Render rules
  md.renderer.rules['math_inline'] = (tokens, idx) => {
    try {
      return katex.default.renderToString(tokens[idx].content, {
        throwOnError: false,
        displayMode: false,
      })
    } catch (e) {
      return `<span class="math-error" title="${String(e)}">${md.utils.escapeHtml(tokens[idx].content)}</span>`
    }
  }

  md.renderer.rules['math_block'] = (tokens, idx) => {
    try {
      return (
        '<p class="math-block">' +
        katex.default.renderToString(tokens[idx].content, {
          throwOnError: false,
          displayMode: true,
        }) +
        '</p>'
      )
    } catch (e) {
      return `<p class="math-error" title="${String(e)}">${md.utils.escapeHtml(tokens[idx].content)}</p>`
    }
  }

  katexLoaded = true
}

export async function renderMarkdown(content: string): Promise<string> {
  const promises: Promise<void>[] = []
  if (hasCode(content)) promises.push(ensureHighlightjs())
  if (hasMath(content)) promises.push(ensureKatex())
  if (promises.length > 0) await Promise.all(promises)
  return md.render(content)
}
