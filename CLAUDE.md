# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite, default port 5173)
npm run build     # tsc type-check + Vite production build
npm run preview   # serve the production build locally
```

No test runner is configured.

## Architecture

Single-page React app. State lives entirely in one Zustand store (`src/store/useAppStore.ts`), persisted to `localStorage` under the key `markdown-vibe-settings` (only UI/typography settings are persisted — not content or the file handle).

Content is auto-saved separately via `useAutoSave` into a different `localStorage` key so it survives hard refreshes.

### Data flow

```
Editor (CodeMirror 6)
  → setContent (Zustand)
  → useMarkdownParser (debounced 100ms)
      → renderMarkdown (src/lib/markdown.ts)
          → lazy-loads highlight.js if ``` present
          → lazy-loads KaTeX inline/block rules if $ present
      → DOMPurify (src/lib/sanitize.ts)
  → Preview (dangerouslySetInnerHTML)
```

### Key files

| File | Purpose |
|---|---|
| `src/store/useAppStore.ts` | Single source of truth: content, file state, view mode, typography settings, toast, cursor |
| `src/lib/markdown.ts` | Singleton `markdown-it` instance; `renderMarkdown()` lazily patches it with highlight.js and a custom KaTeX inline/block rule implementation |
| `src/lib/exportPDF.ts` | Opens a new `window`, writes a self-contained HTML document with content + generated CSS (from `TypographySettings` + `@page` rules), then calls `window.print()` on it. highlight.js rules are copied from the current page's stylesheets so code block colors carry over. |
| `src/lib/copyRichText.ts` | Clones preview HTML, inlines critical styles, writes `text/html` + `text/plain` to the Clipboard API |
| `src/hooks/useFileSystem.ts` | File System Access API with `<input type="file">` / download-blob fallback |
| `src/hooks/useAutoSave.ts` | Debounced write to `localStorage`; `loadDraft()` / `clearDraft()` used by `App.tsx` on mount |
| `src/styles/preview.css` | All preview typography styles scoped to `.preview-content`. Uses zinc/indigo design tokens (zinc-100 code blocks, indigo-600 links, pink-700 inline code). Dynamic values (font family, size, line-height, paragraph spacing) are applied as inline styles by `Preview.tsx`, not via CSS variables. |
| `src/styles/print.css` | Static `@media print` reset loaded globally; dynamic per-export rules are injected by `exportPDF.ts` |

### Typography settings flow

`TypographySettings` (defined in the store) controls both the live preview and PDF output. `Preview.tsx` applies font family, size, line-height, and paragraph spacing as **inline styles** directly on `.preview-content`; heading/code font overrides are injected via a `<style>` tag. `exportPDF.ts` reads the same struct and builds equivalent CSS for the print window.

### Lazy loading

highlight.js and KaTeX are not bundled in the initial chunk. `renderMarkdown()` detects `` ``` `` and `$` in the source and `await`s the relevant loader before calling `md.render()`. The loaders patch the shared `md` singleton in place and set a module-level flag so they only run once.

### UI design tokens

The UI uses **zinc** grays (not slate or gray) with **indigo** as the accent color throughout. Light mode: `zinc-50`/white backgrounds, `zinc-200` borders. Dark mode: `zinc-950`/`zinc-900` backgrounds, `zinc-800` borders. Interactive accents: `indigo-600` (light) / `indigo-400` (dark). Do not introduce blue-500 or gray-* classes — keep the palette consistent.

### File System Access API

`useFileSystem` prefers the modern `showOpenFilePicker` / `showSaveFilePicker` API (Chrome/Edge). Firefox/Safari fall back to `<input type="file">` for open and a download-blob trigger for save. The `FileSystemFileHandle` is stored in Zustand but excluded from `persist` (handles can't be serialized).
