import { useAppStore } from '../store/useAppStore'

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function charCount(text: string): number {
  return text.length
}

function readingTime(words: number): string {
  const mins = Math.ceil(words / 200)
  return mins < 1 ? '<1 min' : `${mins} min`
}

export default function StatusBar() {
  const { content, fileName, isDirty, cursorLine, cursorCol } = useAppStore()

  const words = wordCount(content)
  const chars = charCount(content)
  const rt = readingTime(words)

  return (
    <div className="h-7 flex items-center justify-between px-3 text-[11px] bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 flex-shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span>{words.toLocaleString()} words</span>
        <span className="hidden sm:inline">{chars.toLocaleString()} chars</span>
        <span className="hidden md:inline">{rt} read</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/sabariramdas/markdown-vibe"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          made by diru ↗
        </a>
        <span className="hidden sm:inline">
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span className="flex items-center gap-1.5">
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" aria-label="Unsaved changes" />
          )}
          <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate max-w-32">{fileName}</span>
        </span>
      </div>
    </div>
  )
}
