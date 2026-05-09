import { TypographySettings } from '../store/useAppStore'
import { md } from './markdown'
import { sanitizeHtml } from './sanitize'

function inlineStyles(html: string, typography: TypographySettings): string {
  const headingFont = typography.customHeadingFont || typography.headingFont
  const bodyFont = typography.customBodyFont || typography.bodyFont
  const codeFont = typography.codeFont
  const fs = typography.fontSize
  const lh = typography.lineHeight
  const ps = typography.paragraphSpacing

  const styleMap = {
    h1: `font-family:'${headingFont}',serif;font-size:${fs * 2}pt;font-weight:700;line-height:1.25;margin:0.5em 0;`,
    h2: `font-family:'${headingFont}',serif;font-size:${fs * 1.5}pt;font-weight:700;line-height:1.25;margin:0.5em 0;`,
    h3: `font-family:'${headingFont}',serif;font-size:${fs * 1.17}pt;font-weight:700;line-height:1.25;margin:0.5em 0;`,
    h4: `font-family:'${headingFont}',serif;font-size:${fs}pt;font-weight:700;margin:0.5em 0;`,
    h5: `font-family:'${headingFont}',serif;font-size:${fs * 0.83}pt;font-weight:700;margin:0.5em 0;`,
    h6: `font-family:'${headingFont}',serif;font-size:${fs * 0.67}pt;font-weight:700;margin:0.5em 0;`,
    p: `font-family:'${bodyFont}',serif;font-size:${fs}pt;line-height:${lh};margin:0 0 ${ps}px 0;`,
    pre: `font-family:'${codeFont}',monospace;background:#f5f5f5;border:1px solid #ddd;border-radius:4px;padding:8px;overflow-x:auto;margin:${ps}px 0;font-size:${fs * 0.9}pt;`,
    code: `font-family:'${codeFont}',monospace;background:#f5f5f5;padding:1px 4px;border-radius:3px;font-size:0.9em;`,
    table: `border-collapse:collapse;width:100%;margin:${ps}px 0;`,
    th: `border:1px solid #ccc;padding:8px 12px;text-align:left;font-weight:700;background:#f0f0f0;`,
    td: `border:1px solid #ccc;padding:8px 12px;text-align:left;`,
    blockquote: `border-left:4px solid #ccc;padding:4px 16px;margin:${ps}px 0;color:#555;font-style:italic;`,
    li: `margin-bottom:4px;`,
    ul: `margin:${ps}px 0;padding-left:2em;`,
    ol: `margin:${ps}px 0;padding-left:2em;`,
  } as const

  // DOM-based approach — more robust than regex
  const doc = new DOMParser().parseFromString(html, 'text/html')

  Object.entries(styleMap).forEach(([tag, styleStr]) => {
    doc.querySelectorAll(tag).forEach((el) => {
      const existing = el.getAttribute('style') || ''
      el.setAttribute('style', styleStr + existing)
    })
  })

  return doc.body.innerHTML
}

function stripTags(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const lines: string[] = []

  const walk = (el: Element) => {
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || '').trim()
        if (text) lines.push(text)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toLowerCase()
        if (tag === 'li') {
          const text = (node.textContent || '').trim()
          if (text) lines.push(`• ${text}`)
        } else {
          walk(node as Element)
        }
        const isBlock = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'ul', 'ol', 'blockquote', 'pre'].includes(tag)
        if (isBlock && node !== el.lastChild) lines.push('')
      }
    })
  }

  walk(doc.body)
  return lines.join('\n').replace(/\n\n+/g, '\n\n').trim()
}

function buildFragment(html: string, typography: TypographySettings): string {
  const bodyFont = typography.customBodyFont || typography.bodyFont
  const fs = typography.fontSize
  const lh = typography.lineHeight

  // Minimal wrapper — no DOCTYPE, helps Google Docs/Word parse better
  return `<div style="font-family:'${bodyFont}',serif;font-size:${fs}pt;line-height:${lh};color:#000;margin:0;">${html}</div>`
}

export async function copyAsRichText(
  markdown: string,
  typography: TypographySettings
): Promise<void> {
  const rawHtml = md.render(markdown)
  const clean = sanitizeHtml(rawHtml)
  const styledHtml = inlineStyles(clean, typography)
  const fragment = buildFragment(styledHtml, typography)
  const plainText = stripTags(clean)

  // Method 1: ClipboardItem API (best for Chrome/Edge)
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([fragment], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ])
      return
    } catch (e) {
      console.warn('ClipboardItem failed:', e)
    }
  }

  // Method 2: Copy-event interception (most reliable fallback)
  try {
    await new Promise<void>((resolve, reject) => {
      const handler = (e: ClipboardEvent) => {
        e.preventDefault()
        e.clipboardData?.setData('text/plain', plainText)
        e.clipboardData?.setData('text/html', fragment)  // ✅ Gunakan fragment
        resolve()
      }
      document.addEventListener('copy', handler, { once: true })
      if (!document.execCommand('copy')) {
        document.removeEventListener('copy', handler)
        reject(new Error('execCommand returned false'))
      }
    })
    return
  } catch (e) {
    console.warn('Copy-event interception failed:', e)
  }

  // Method 3: contentEditable + execCommand (last resort)
  const el = document.createElement('div')
  el.contentEditable = 'true'
  el.innerHTML = styledHtml
  el.style.position = 'fixed'
  el.style.left = '0'
  el.style.top = '-9999px'
  document.body.appendChild(el)
  const sel = window.getSelection()
  const range = document.createRange()
  range.selectNodeContents(el)
  sel?.removeAllRanges()
  sel?.addRange(range)
  document.execCommand('copy')
  sel?.removeAllRanges()
  document.body.removeChild(el)
}

export async function copyAsMarkdown(content: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content)
    return
  }
  const el = document.createElement('textarea')
  el.value = content
  el.style.position = 'fixed'
  el.style.top = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}