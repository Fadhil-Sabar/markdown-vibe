import { useEffect, useRef } from 'react'

const DRAFT_KEY = 'markdown-vibe-draft'
const DRAFT_FILENAME_KEY = 'markdown-vibe-draft-filename'

export function saveContentDraft(content: string, fileName: string): void {
  try {
    localStorage.setItem(DRAFT_KEY, content)
    localStorage.setItem(DRAFT_FILENAME_KEY, fileName)
  } catch {}
}

export function loadDraft(): { content: string; fileName: string } | null {
  try {
    const content = localStorage.getItem(DRAFT_KEY)
    const fileName = localStorage.getItem(DRAFT_FILENAME_KEY) || 'Untitled.md'
    if (content !== null) return { content, fileName }
  } catch {}
  return null
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_FILENAME_KEY)
  } catch {}
}

export function useAutoSave(content: string, fileName: string, enabled = true): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      saveContentDraft(content, fileName)
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content, fileName, enabled])
}
