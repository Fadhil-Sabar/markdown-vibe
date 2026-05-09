# Markdown Vibe

A fast, minimal Markdown editor with live preview, built with React + Vite.

**[Live Demo →](https://markdown-vibe.pages.dev)**  
**[Source Code →](https://github.com/Fadhil-Sabar/markdown-vibe)**

---

## Features

- **Live split preview** — editor and preview side by side, updates in 100ms
- **Syntax highlighting** — via highlight.js (lazy-loaded)
- **Math rendering** — KaTeX inline (`$...$`) and block (`$$...$$`) support (lazy-loaded)
- **PDF export** — browser print engine with custom typography settings
- **Rich text copy** — paste into Google Docs, Notion, or Gmail with formatting intact
- **File System Access API** — open/save `.md` files natively (Chrome/Edge); fallback download for Firefox/Safari
- **Auto-save** — drafts persist to `localStorage` across sessions
- **Typography settings** — font family, size, line height, paragraph spacing, margins
- **Dark mode**
- **Task lists, tables, strikethrough** — full CommonMark + GFM

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd+S` | Save file |
| `Ctrl/Cmd+Shift+S` | Save As |
| `Ctrl/Cmd+O` | Open file |
| `Ctrl/Cmd+Shift+N` | New file |
| `Ctrl/Cmd+B` | Bold selection |
| `Ctrl/Cmd+I` | Italic selection |
| `Ctrl/Cmd+K` | Insert link |

## Development

```bash
npm install
npm run dev      # starts at http://localhost:5173
npm run build    # type-check + production build
npm run preview  # serve production build locally
```

## Tech Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [CodeMirror 6](https://codemirror.net)
- [markdown-it](https://github.com/markdown-it/markdown-it) + [highlight.js](https://highlightjs.org) + [KaTeX](https://katex.org)
- [Zustand](https://zustand-demo.pmnd.rs) (state)
- [Tailwind CSS](https://tailwindcss.com)
- [DOMPurify](https://github.com/cure53/DOMPurify) (XSS sanitization)

## Deployment

Deployed on [Cloudflare Pages](https://pages.cloudflare.com).

- Build command: `npm run build`
- Output directory: `dist`
- `public/_redirects` handles SPA routing fallback

---

Made by [Fadhil Sabar](https://github.com/Fadhil-Sabar)
