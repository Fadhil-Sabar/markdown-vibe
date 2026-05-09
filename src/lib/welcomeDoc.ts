export const WELCOME_DOCUMENT = `# Welcome to Markdown Vibe ✨

A fast, clean Markdown editor with live preview, PDF export, and rich text copy.

---

## Features

### Live Preview
Type on the left, see the result on the right — updates in real time.

### Typography Control
Use the **Settings** panel (⚙️ icon) to customize:
- Body & heading fonts (Times New Roman, Georgia, Inter, and more)
- Font size (10–24pt)
- Line height and paragraph spacing
- Page margins and size

### Export Options
- **Export PDF** — uses your browser's print engine for crisp typography
- **Copy as Rich Text** — paste into Google Docs, Word, or Gmail with formatting preserved
- **Copy as Markdown** — copy the raw source

---

## Markdown Examples

### Text Formatting

**Bold text**, _italic text_, ~~strikethrough~~, and \`inline code\`.

### Blockquote

> "The best way to get a good idea is to have a lot of ideas." — Linus Pauling

### Lists

**Unordered:**
- Item one
  - Nested item
  - Another nested item
- Item two
- Item three

**Ordered:**
1. First step
2. Second step
3. Third step

**Task list:**
- [x] Write the spec
- [x] Build the editor
- [ ] Ship v1

---

### Code Block

\`\`\`typescript
interface Document {
  title: string
  content: string
  createdAt: Date
}

function parseMarkdown(source: string): string {
  return markdownIt.render(source)
}
\`\`\`

---

### Table

| Feature | Status | Notes |
|---|---|---|
| Live preview | ✅ | Debounced 100ms |
| PDF export | ✅ | Via window.print() |
| Rich text copy | ✅ | Clipboard API |
| Math (KaTeX) | ✅ | Lazy-loaded |
| Syntax highlighting | ✅ | highlight.js |

---

### Math (KaTeX)

Inline math: The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

---

### Image

![Placeholder](https://placehold.co/600x200/EEE/999?text=Image+Placeholder)

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| \`Ctrl/Cmd+S\` | Save file |
| \`Ctrl/Cmd+O\` | Open file |
| \`Ctrl/Cmd+B\` | Bold selection |
| \`Ctrl/Cmd+I\` | Italic selection |
| \`Ctrl/Cmd+K\` | Insert link |
| \`Ctrl/Cmd+Shift+S\` | Save As |
| \`Ctrl/Cmd+Shift+N\` | New file |

---

*Start editing to replace this document. Your changes are auto-saved to localStorage every 2 seconds.*
`
