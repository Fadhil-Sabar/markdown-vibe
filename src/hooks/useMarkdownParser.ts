import { useState, useEffect, useRef } from 'react'
import { renderMarkdown } from '../lib/markdown'
import { sanitizeHtml } from '../lib/sanitize'

export function useMarkdownParser(content: string, debounceMs = 100) {
  const [html, setHtml] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestContent = useRef(content)

  useEffect(() => {
    latestContent.current = content

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      const rendered = await renderMarkdown(latestContent.current)
      const clean = sanitizeHtml(rendered)
      setHtml(clean)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content, debounceMs])

  return html
}
