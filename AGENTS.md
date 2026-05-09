# AGENTS.md

## Commands

```bash
npm run dev       # dev server (port 5173)
npm run build     # tsc (strict: noUnusedLocals, noUnusedParameters) + vite build
npm run preview   # serve production build locally
```

No test runner, linter, or formatter configured.

## Architecture

Single-page React 18 + Vite 6 app. Markdown editor with live preview, PDF export, and rich-text copy.

### Key facts not obvious from filenames

- **Store**: single Zustand store (`src/store/useAppStore.ts`). Persisted to `localStorage` key `markdown-vibe-settings` — but only `darkMode`, `typography`, `viewMode`, `splitRatio`, `syncScroll`. Content and `fileHandle` are excluded from persist.
- **Content auto-save**: separate `localStorage` keys `markdown-vibe-draft` / `markdown-vibe-draft-filename`, debounced 2s after last edit. Restored on mount with a dismissible banner.
- **Markdown rendering**: debounced 100ms via `useMarkdownParser` hook → `renderMarkdown()` in `src/lib/markdown.ts`. Lazy-loads highlight.js if `` ``` `` detected, KaTeX inline/block rules if `$` detected. Both patch the singleton `markdown-it` instance once.
- **Sanitization**: All rendered HTML passes through DOMPurify (allows KaTeX math tags and `style`/`class` attributes).
- **KaTeX CSS**: loaded dynamically via `<link>` tag in DOM when math is detected (not bundled).
- **PDF export**: opens a new window, writes self-contained HTML with generated CSS, calls `window.print()`. highlight.js styles are copied from the current page's stylesheets. KaTeX CSS loaded from CDN.
- **Rich-text copy**: clones preview, inlines critical font/size styles into elements via DOMParser, writes dual MIME `text/html` + `text/plain` to Clipboard API. Falls back to `execCommand('copy')`.
- **File I/O**: prefers File System Access API (`showOpenFilePicker`/`showSaveFilePicker`). Falls back to `<input type="file">` and blob download. Accepts `.md`, `.markdown`, `.txt`.

### Data flow

```
Editor (CodeMirror 6)
  → setContent (Zustand)
  → useMarkdownParser (debounced 100ms)
    → renderMarkdown (lazy-loads highlight.js / KaTeX as needed)
    → DOMPurify sanitize
  → Preview (dangerouslySetInnerHTML)
```

### UI design tokens

**zinc** grays, **indigo** accent. Light: `zinc-50`/white bg, `zinc-200` borders. Dark: `zinc-950`/`zinc-900` bg, `zinc-800` borders. Accents: `indigo-600` (light) / `indigo-400` (dark). Pink-700 for inline code text. Tailwind dark mode via `class` strategy.

### Vite config quirks

`optimizeDeps.include` forces pre-bundling of `markdown-it` and `dompurify`.

### Global CSS side effects (in `src/index.css`)

- CodeMirror editor: `height: 100% !important`, `font-size: 14px !important`, JetBrains Mono font
- Thin scrollbar globally (`scrollbar-width: thin`, 6px WebKit thumb)
- `.hljs` block has `padding: 1em` (highlight.js wrapper reset)

## Entrypoints

| File | Role |
|---|---|
| `src/main.tsx` | App mount |
| `src/App.tsx` | Layout shell: toolbar, resizable split pane (20-80%), settings slide-out, modals, status bar, toast, draft banner |
| `src/store/useAppStore.ts` | All shared state |
| `src/lib/markdown.ts` | `markdown-it` singleton + lazy loaders |
| `src/lib/exportPDF.ts` | `window.print()`-based PDF |
| `src/lib/copyRichText.ts` | Clipboard API rich text + Markdown copy |

## Key stores

- Settings persist key: `markdown-vibe-settings` (partial: darkMode, typography, viewMode, splitRatio, syncScroll)
- Draft keys: `markdown-vibe-draft`, `markdown-vibe-draft-filename`
- First visit flag: `markdown-vibe-first-visit` (shows welcome doc)

## Edge cases

- Files >5MB: warning toast, still loaded
- Non-Markdown extension: warning toast, loaded as plain text
- Beforeunload guard when `isDirty` is true
- Title bar shows `• filename.md — Markdown Vibe` when dirty
- Keyboard shortcuts: `Cmd/Ctrl+S` save, `Shift+Cmd/Ctrl+S` save as, `Cmd/Ctrl+O` open, `Shift+Cmd/Ctrl+N` new
