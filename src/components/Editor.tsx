import { useEffect, useRef, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { HighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { useAppStore } from '../store/useAppStore'

// Minimal prose-friendly theme — no blue syntax coloring on headings/text
const proseLight = EditorView.theme({
  '&': { backgroundColor: '#ffffff', color: '#18181b' },
  '.cm-content': { padding: '16px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#18181b' },
  '.cm-activeLine': { backgroundColor: '#fafafa' },
  '.cm-activeLineGutter': { backgroundColor: '#f4f4f5' },
  '.cm-gutters': { backgroundColor: '#fafafa', color: '#a1a1aa', border: 'none', borderRight: '1px solid #f4f4f5' },
  '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '8px', paddingRight: '16px', minWidth: '40px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#e0e7ff' },
  '.cm-line': { paddingLeft: '20px', paddingRight: '20px' },
}, { dark: false })

const proseDark = EditorView.theme({
  '&': { backgroundColor: '#18181b', color: '#e4e4e7' },
  '.cm-content': { padding: '16px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#e4e4e7' },
  '.cm-activeLine': { backgroundColor: '#1f1f23' },
  '.cm-activeLineGutter': { backgroundColor: '#1f1f23' },
  '.cm-gutters': { backgroundColor: '#18181b', color: '#52525b', border: 'none', borderRight: '1px solid #27272a' },
  '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '8px', paddingRight: '16px', minWidth: '40px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#312e81' },
  '.cm-line': { paddingLeft: '20px', paddingRight: '20px' },
}, { dark: true })

const proseHighlightLight = HighlightStyle.define([
  { tag: [t.heading1, t.heading2, t.heading3], fontWeight: '700', color: '#18181b' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '600', color: '#3f3f46' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.link, t.url], color: '#4f46e5' },
  { tag: t.monospace, color: '#be185d' },
  { tag: t.quote, color: '#71717a', fontStyle: 'italic' },
  { tag: [t.keyword, t.operator], color: '#7c3aed' },
  { tag: t.number, color: '#b45309' },
  { tag: [t.string, t.special(t.string)], color: '#15803d' },
  { tag: t.comment, color: '#a1a1aa' },
  { tag: [t.typeName, t.className], color: '#0369a1' },
  { tag: t.meta, color: '#a1a1aa' },
  { tag: t.processingInstruction, color: '#71717a' },
  { tag: t.punctuation, color: '#a1a1aa' },
])

const proseHighlightDark = HighlightStyle.define([
  { tag: [t.heading1, t.heading2, t.heading3], fontWeight: '700', color: '#f4f4f5' },
  { tag: [t.heading4, t.heading5, t.heading6], fontWeight: '600', color: '#d4d4d8' },
  { tag: t.strong, fontWeight: '700' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: [t.link, t.url], color: '#818cf8' },
  { tag: t.monospace, color: '#f472b6' },
  { tag: t.quote, color: '#a1a1aa', fontStyle: 'italic' },
  { tag: [t.keyword, t.operator], color: '#a78bfa' },
  { tag: t.number, color: '#fbbf24' },
  { tag: [t.string, t.special(t.string)], color: '#34d399' },
  { tag: t.comment, color: '#71717a' },
  { tag: [t.typeName, t.className], color: '#38bdf8' },
  { tag: t.meta, color: '#71717a' },
  { tag: t.processingInstruction, color: '#71717a' },
  { tag: t.punctuation, color: '#52525b' },
])

interface EditorProps {
  className?: string
}

// Wrap/bold/italic/link insertion helpers
function wrapSelection(view: EditorView, before: string, after: string) {
  const { state } = view
  const selection = state.selection.main
  const selectedText = state.sliceDoc(selection.from, selection.to)
  const newText = before + selectedText + after
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert: newText },
    selection: { anchor: selection.from + before.length, head: selection.from + before.length + selectedText.length },
  })
  view.focus()
}

function insertLink(view: EditorView) {
  const { state } = view
  const selection = state.selection.main
  const selectedText = state.sliceDoc(selection.from, selection.to)
  const linkText = selectedText || 'link text'
  const newText = `[${linkText}](url)`
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert: newText },
    selection: { anchor: selection.from + 1, head: selection.from + 1 + linkText.length },
  })
  view.focus()
}

export default function Editor({ className = '' }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { content, setContent, darkMode, setIsDirty, setCursor } = useAppStore()

  // Keep a ref to content to avoid stale closures in the update listener
  const contentRef = useRef(content)
  contentRef.current = content

  const handleChange = useCallback(
    (newContent: string) => {
      if (newContent !== contentRef.current) {
        setContent(newContent)
        setIsDirty(true)
      }
    },
    [setContent, setIsDirty]
  )

  // Build the editor extensions
  const buildExtensions = useCallback(
    (dark: boolean) => [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      syntaxHighlighting(dark ? proseHighlightDark : proseHighlightLight, { fallback: true }),
      history(),
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      dark ? proseDark : proseLight,
      EditorView.lineWrapping,
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
        // Bold: Ctrl/Cmd+B
        {
          key: 'Mod-b',
          run(view) {
            wrapSelection(view, '**', '**')
            return true
          },
        },
        // Italic: Ctrl/Cmd+I
        {
          key: 'Mod-i',
          run(view) {
            wrapSelection(view, '_', '_')
            return true
          },
        },
        // Link: Ctrl/Cmd+K
        {
          key: 'Mod-k',
          run(view) {
            insertLink(view)
            return true
          },
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          handleChange(update.state.doc.toString())
        }
        // Track cursor position
        const cursor = update.state.selection.main.head
        const line = update.state.doc.lineAt(cursor)
        setCursor(line.number, cursor - line.from + 1)
      }),
    ],
    [handleChange, setCursor]
  )

  // Initialize editor on mount
  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: content,
      extensions: buildExtensions(darkMode),
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update theme when darkMode changes
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: [],
    })
    // Recreate state with new extensions to swap theme
    const newState = EditorState.create({
      doc: view.state.doc,
      extensions: buildExtensions(darkMode),
      selection: view.state.selection,
    })
    view.setState(newState)
  }, [darkMode, buildExtensions])

  // Sync content from store → editor when changed externally (e.g., file open)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentDoc = view.state.doc.toString()
    if (currentDoc !== content) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: content },
        selection: { anchor: 0 },
      })
    }
  }, [content])

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-auto ${className}`}
      style={{ fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace' }}
    />
  )
}
