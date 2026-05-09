import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'editor' | 'split' | 'preview'
export type MarginPreset = 'normal' | 'narrow' | 'wide' | 'custom'
export type PageSize = 'A4' | 'Letter' | 'Legal' | 'A5'

export interface TypographySettings {
  bodyFont: string
  headingFont: string
  codeFont: string
  customBodyFont: string
  customHeadingFont: string
  fontSize: number // pt
  lineHeight: number
  paragraphSpacing: number // px
  marginPreset: MarginPreset
  marginTop: number // mm
  marginRight: number
  marginBottom: number
  marginLeft: number
  pageSize: PageSize
  previewDark: boolean
}

export interface AppState {
  // Content
  content: string
  setContent: (content: string) => void

  // File
  fileName: string
  setFileName: (name: string) => void
  fileHandle: FileSystemFileHandle | null
  setFileHandle: (handle: FileSystemFileHandle | null) => void
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void

  // View
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  splitRatio: number // 0-100, editor side percentage
  setSplitRatio: (ratio: number) => void
  printPreviewMode: boolean
  setPrintPreviewMode: (active: boolean) => void
  syncScroll: boolean
  setSyncScroll: (sync: boolean) => void

  // UI
  darkMode: boolean
  toggleDarkMode: () => void
  settingsPanelOpen: boolean
  setSettingsPanelOpen: (open: boolean) => void
  exportModalOpen: boolean
  setExportModalOpen: (open: boolean) => void

  // Toast
  toast: string | null
  showToast: (msg: string) => void
  clearToast: () => void

  // Typography
  typography: TypographySettings
  setTypography: (settings: Partial<TypographySettings>) => void

  // Cursor
  cursorLine: number
  cursorCol: number
  setCursor: (line: number, col: number) => void
}

const defaultTypography: TypographySettings = {
  bodyFont: 'Georgia',
  headingFont: 'Georgia',
  codeFont: 'JetBrains Mono',
  customBodyFont: '',
  customHeadingFont: '',
  fontSize: 12,
  lineHeight: 1.5,
  paragraphSpacing: 12,
  marginPreset: 'normal',
  marginTop: 25,
  marginRight: 25,
  marginBottom: 25,
  marginLeft: 25,
  pageSize: 'A4',
  previewDark: false,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      content: '',
      setContent: (content) => set({ content }),

      fileName: 'Untitled.md',
      setFileName: (fileName) => set({ fileName }),
      fileHandle: null,
      setFileHandle: (fileHandle) => set({ fileHandle }),
      isDirty: false,
      setIsDirty: (isDirty) => set({ isDirty }),

      viewMode: 'split',
      setViewMode: (viewMode) => set({ viewMode }),
      splitRatio: 50,
      setSplitRatio: (splitRatio) => set({ splitRatio }),
      printPreviewMode: false,
      setPrintPreviewMode: (printPreviewMode) => set({ printPreviewMode }),
      syncScroll: true,
      setSyncScroll: (syncScroll) => set({ syncScroll }),

      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      settingsPanelOpen: false,
      setSettingsPanelOpen: (settingsPanelOpen) => set({ settingsPanelOpen }),
      exportModalOpen: false,
      setExportModalOpen: (exportModalOpen) => set({ exportModalOpen }),

      toast: null,
      showToast: (msg) => {
        set({ toast: msg })
        // Clear after 2.5s
        setTimeout(() => {
          if (get().toast === msg) set({ toast: null })
        }, 2500)
      },
      clearToast: () => set({ toast: null }),

      typography: defaultTypography,
      setTypography: (settings) =>
        set((s) => ({ typography: { ...s.typography, ...settings } })),

      cursorLine: 1,
      cursorCol: 1,
      setCursor: (cursorLine, cursorCol) => set({ cursorLine, cursorCol }),
    }),
    {
      name: 'markdown-vibe-settings',
      // Only persist settings + dark mode, not content/fileHandle
      partialize: (state) => ({
        darkMode: state.darkMode,
        typography: state.typography,
        viewMode: state.viewMode,
        splitRatio: state.splitRatio,
        syncScroll: state.syncScroll,
      }),
    }
  )
)
