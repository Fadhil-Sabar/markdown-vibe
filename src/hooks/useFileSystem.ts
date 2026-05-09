import { useAppStore } from '../store/useAppStore'

const FILE_SIZE_WARNING = 5 * 1024 * 1024 // 5MB

// Check if the File System Access API is available (Chrome/Edge)
function hasFSA(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}

export function useFileSystem() {
  const {
    content,
    setContent,
    fileName,
    setFileName,
    fileHandle,
    setFileHandle,
    isDirty,
    setIsDirty,
    showToast,
  } = useAppStore()

  async function newFile() {
    if (isDirty) {
      const ok = window.confirm('You have unsaved changes. Discard and create new file?')
      if (!ok) return
    }
    setContent('')
    setFileName('Untitled.md')
    setFileHandle(null)
    setIsDirty(false)
  }

  async function openFile() {
    if (hasFSA()) {
      try {
        const [handle] = await (window as Window & typeof globalThis & {
          showOpenFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle[]>
        }).showOpenFilePicker({
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md', '.markdown', '.txt'] } }],
          multiple: false,
        })
        const file = await handle.getFile()
        await readFileObject(file, handle)
      } catch (e: unknown) {
        // User cancelled — not an error
        if (e instanceof Error && e.name !== 'AbortError') {
          showToast('Failed to open file')
        }
      }
    } else {
      // Fallback: hidden <input>
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.md,.markdown,.txt'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (file) await readFileObject(file, null)
      }
      input.click()
    }
  }

  async function readFileObject(file: File, handle: FileSystemFileHandle | null) {
    if (file.size > FILE_SIZE_WARNING) {
      showToast('Large file (>5MB) — preview performance may be affected')
    }
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext && !['md', 'markdown', 'txt'].includes(ext)) {
      showToast('File may not be Markdown — loaded as plain text')
    }
    const text = await file.text()
    setContent(text)
    setFileName(file.name)
    setFileHandle(handle)
    setIsDirty(false)
  }

  async function saveFile() {
    if (fileHandle) {
      try {
        const writable = await (fileHandle as FileSystemFileHandle & {
          createWritable: () => Promise<{ write: (s: string) => Promise<void>; close: () => Promise<void> }>
        }).createWritable()
        await writable.write(content)
        await writable.close()
        setIsDirty(false)
        showToast('Saved')
        return
      } catch {
        showToast('Save failed — trying Save As')
      }
    }
    await saveAsFile()
  }

  async function saveAsFile() {
    if (hasFSA()) {
      try {
        const handle = await (window as Window & typeof globalThis & {
          showSaveFilePicker: (opts?: unknown) => Promise<FileSystemFileHandle>
        }).showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
        })
        const writable = await (handle as FileSystemFileHandle & {
          createWritable: () => Promise<{ write: (s: string) => Promise<void>; close: () => Promise<void> }>
        }).createWritable()
        await writable.write(content)
        await writable.close()
        setFileName(handle.name)
        setFileHandle(handle)
        setIsDirty(false)
        showToast('Saved')
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') {
          showToast('Save failed')
        }
      }
    } else {
      // Fallback: download blob
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`
      a.click()
      URL.revokeObjectURL(url)
      setIsDirty(false)
      showToast('Downloaded')
    }
  }

  return { newFile, openFile, saveFile, saveAsFile }
}
