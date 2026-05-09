import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore } from './store/useAppStore'
import { useAutoSave, loadDraft, clearDraft } from './hooks/useAutoSave'
import { useFileSystem } from './hooks/useFileSystem'
import { WELCOME_DOCUMENT } from './lib/welcomeDoc'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import SettingsPanel from './components/SettingsPanel'
import ExportPDFModal from './components/ExportPDFModal'
import StatusBar from './components/StatusBar'

const FIRST_VISIT_KEY = 'markdown-vibe-first-visit'

function Toast() {
  const { toast } = useAppStore()
  if (!toast) return null
  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-lg text-sm font-medium pointer-events-none transition-opacity"
    >
      {toast}
    </div>
  )
}

function DraftBanner({ onRestore, onDiscard }: { onRestore: () => void; onDiscard: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300 flex-shrink-0">
      <span className="flex-1">Restored unsaved changes from a previous session.</span>
      <button
        onClick={onRestore}
        className="px-3 py-1 rounded-md bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-200 font-medium text-xs transition-colors"
      >
        Keep
      </button>
      <button
        onClick={onDiscard}
        className="px-3 py-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-400 text-xs transition-colors"
      >
        Discard
      </button>
    </div>
  )
}

export default function App() {
  const {
    content,
    setContent,
    fileName,
    setFileName,
    isDirty,
    setIsDirty,
    darkMode,
    viewMode,
    setViewMode,
    splitRatio,
    setSplitRatio,
    settingsPanelOpen,
    setSettingsPanelOpen,
    exportModalOpen,
  } = useAppStore()

  const { saveFile, saveAsFile, newFile, openFile } = useFileSystem()

  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [draftContent, setDraftContent] = useState<{ content: string; fileName: string } | null>(null)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-save
  useAutoSave(content, fileName)

  // On first mount: check for draft or show welcome
  useEffect(() => {
    const draft = loadDraft()
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)

    if (window.innerWidth < 640) {
      setViewMode('editor')
    }

    if (draft && draft.content) {
      // Show banner offering to restore
      setDraftContent(draft)
      setShowDraftBanner(true)
      // Pre-load the draft so user can see it
      setContent(draft.content)
      setFileName(draft.fileName)
      setIsDirty(true)
    } else if (isFirstVisit) {
      localStorage.setItem(FIRST_VISIT_KEY, '1')
      setContent(WELCOME_DOCUMENT)
      setFileName('welcome.md')
      setIsDirty(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update document title
  useEffect(() => {
    document.title = `${isDirty ? '• ' : ''}${fileName} — Markdown Vibe`
  }, [isDirty, fileName])

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return

      if (e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        saveFile()
      } else if (e.key === 's' && e.shiftKey) {
        e.preventDefault()
        saveAsFile()
      } else if (e.key === 'o') {
        e.preventDefault()
        openFile()
      } else if (e.key === 'n' && e.shiftKey) {
        e.preventDefault()
        newFile()
      }
    },
    [saveFile, saveAsFile, openFile, newFile]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Split pane drag
  function onDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    isDragging.current = true

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = ((ev.clientX - rect.left) / rect.width) * 100
      setSplitRatio(Math.min(80, Math.max(20, ratio)))
    }

    const onMouseUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function handleDiscardDraft() {
    clearDraft()
    setShowDraftBanner(false)
    setDraftContent(null)
    setContent(WELCOME_DOCUMENT)
    setFileName('welcome.md')
    setIsDirty(false)
  }

  function handleKeepDraft() {
    setShowDraftBanner(false)
    setDraftContent(null)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden">
        <Toolbar />

        {showDraftBanner && draftContent && (
          <DraftBanner onRestore={handleKeepDraft} onDiscard={handleDiscardDraft} />
        )}

        {/* Main content area */}
        <div ref={containerRef} className="flex-1 flex min-h-0 overflow-hidden">
          {/* Editor pane */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div
              className="flex-shrink-0 min-w-0 overflow-hidden border-r border-zinc-200 dark:border-zinc-800"
              style={{
                width: viewMode === 'split' ? `${splitRatio}%` : '100%',
              }}
            >
              <Editor className="h-full" />
            </div>
          )}

          {/* Drag divider */}
          {viewMode === 'split' && (
            <div
              onMouseDown={onDividerMouseDown}
              className="w-px bg-zinc-200 dark:bg-zinc-800 hover:bg-indigo-400 dark:hover:bg-indigo-500 cursor-col-resize flex-shrink-0 transition-colors"
              title="Drag to resize"
            />
          )}

          {/* Preview pane */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className="flex-1 min-w-0 overflow-hidden"
              style={viewMode === 'split' ? { width: `${100 - splitRatio}%` } : undefined}
            >
              <Preview className="h-full" />
            </div>
          )}

            {/* Settings panel: overlay on mobile, inline on desktop */}
          {settingsPanelOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-30 sm:hidden"
                onClick={() => setSettingsPanelOpen(false)}
              />
              <div className="fixed inset-y-0 right-0 z-40 sm:relative sm:inset-auto sm:z-auto">
                <SettingsPanel />
              </div>
            </>
          )}
        </div>

        <StatusBar />

        {/* Modals */}
        {exportModalOpen && <ExportPDFModal />}

        <Toast />
      </div>
    </div>
  )
}
