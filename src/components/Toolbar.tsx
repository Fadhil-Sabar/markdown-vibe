import {
  FilePlus,
  FolderOpen,
  Save,
  SaveAll,
  Printer,
  FileDown,
  Clipboard,
  FileText,
  Settings,
  Moon,
  Sun,
} from 'lucide-react'
import { useAppStore, ViewMode } from '../store/useAppStore'
import { useFileSystem } from '../hooks/useFileSystem'
import { copyAsRichText, copyAsMarkdown } from '../lib/copyRichText'

interface IconButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  activeClassName?: string
}

function IconButton({
  onClick,
  title,
  children,
  active = false,
  disabled = false,
  activeClassName = '',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`
        p-2 sm:p-1.5 rounded-md transition-colors
        ${active
          ? activeClassName || 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-2" />
}

export default function Toolbar() {
  const {
    content,
    viewMode,
    setViewMode,
    printPreviewMode,
    setPrintPreviewMode,
    darkMode,
    toggleDarkMode,
    setSettingsPanelOpen,
    settingsPanelOpen,
    setExportModalOpen,
    typography,
    showToast,
  } = useAppStore()

  const { newFile, openFile, saveFile, saveAsFile } = useFileSystem()

  const viewSegments: { mode: ViewMode; label: string; shortLabel: string; title: string }[] = [
    { mode: 'editor', label: 'Editor', shortLabel: 'E', title: 'Editor only' },
    { mode: 'split', label: 'Split', shortLabel: 'S', title: 'Split view' },
    { mode: 'preview', label: 'Preview', shortLabel: 'P', title: 'Preview only' },
  ]

  async function handleCopyRichText() {
    try {
      await copyAsRichText(content, typography)
      showToast('Copied as rich text!')
    } catch {
      showToast('Copy failed — check browser permissions')
    }
  }

  async function handleCopyMarkdown() {
    try {
      await copyAsMarkdown(content)
      showToast('Markdown copied!')
    } catch {
      showToast('Copy failed')
    }
  }

  return (
    <div className="h-11 flex items-center px-2 sm:px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 min-w-0">
      {/* Left: File operations */}
      <div className="flex items-center gap-0.5">
        <IconButton onClick={newFile} title="New file (Ctrl+Shift+N)">
          <FilePlus size={15} />
        </IconButton>
        <IconButton onClick={openFile} title="Open file (Ctrl+O)">
          <FolderOpen size={15} />
        </IconButton>
        <IconButton onClick={saveFile} title="Save (Ctrl+S)">
          <Save size={15} />
        </IconButton>
        <span className="hidden sm:contents">
          <IconButton onClick={saveAsFile} title="Save As (Ctrl+Shift+S)">
            <SaveAll size={15} />
          </IconButton>
        </span>
      </div>

      <Divider />

      {/* Center: View toggle segmented control */}
      <div className="flex items-center gap-2">
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 flex gap-0.5">
          {viewSegments.map(({ mode, label, shortLabel, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={title}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <IconButton
          onClick={() => setPrintPreviewMode(!printPreviewMode)}
          title="Toggle print preview"
          active={printPreviewMode}
        >
          <Printer size={15} />
        </IconButton>
      </div>

      <div className="flex-1" />

      {/* Right: Export + Settings */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setExportModalOpen(true)}
          title="Export PDF"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <FileDown size={13} />
            <span className="hidden sm:inline">Export PDF</span>
          </span>
        </button>

        <IconButton onClick={handleCopyRichText} title="Copy as Rich Text">
          <Clipboard size={15} />
        </IconButton>
        <IconButton onClick={handleCopyMarkdown} title="Copy as Markdown">
          <FileText size={15} />
        </IconButton>

        <Divider />

        <IconButton
          onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
          title="Settings"
          active={settingsPanelOpen}
        >
          <Settings size={15} />
        </IconButton>
        <IconButton onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>
      </div>
    </div>
  )
}
