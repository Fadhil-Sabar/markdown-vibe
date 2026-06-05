import { useState } from 'react'
import { X, FileDown } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { triggerPrint, extractTitle, PDFExportOptions } from '../lib/exportPDF'
import { useMarkdownParser } from '../hooks/useMarkdownParser'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-zinc-700 dark:text-zinc-300">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full peer-checked:bg-indigo-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  )
}

export default function ExportPDFModal() {
  const { content, typography, setExportModalOpen } = useAppStore()
  const html = useMarkdownParser(content, 0)

  const [options, setOptions] = useState<PDFExportOptions>({
    headerText: '',
    footerText: '{page} / {total}',
    showPageNumbers: true,
    showDate: false,
    includeCodeBackground: true,
  })

  function handleExport() {
    triggerPrint(html, typography, options)
    setExportModalOpen(false)
  }

  const suggestedName = extractTitle(html) || 'untitled'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <FileDown size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Export PDF</h2>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg px-4 py-3 text-sm">
            <div className="font-medium">{suggestedName}.pdf</div>
            <div className="text-xs mt-0.5 text-indigo-500 dark:text-indigo-400">
              {typography.pageSize} · {typography.landscape ? 'Landscape' : 'Portrait'} · {typography.marginTop}/{typography.marginRight}/{typography.marginBottom}/{typography.marginLeft}mm · {typography.customBodyFont || typography.bodyFont} {typography.fontSize}pt
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Header text <span className="text-zinc-400 font-normal">(supports {'{title}'})</span>
            </label>
            <input
              type="text"
              placeholder="e.g. My Document"
              value={options.headerText}
              onChange={(e) => setOptions((o) => ({ ...o, headerText: e.target.value }))}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder-zinc-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Footer text{' '}
              <span className="text-zinc-400 font-normal">(supports {'{page}'} & {'{total}'})</span>
            </label>
            <input
              type="text"
              placeholder="e.g. {page} / {total}"
              value={options.footerText}
              onChange={(e) => setOptions((o) => ({ ...o, footerText: e.target.value }))}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder-zinc-400"
            />
          </div>

          <div className="space-y-3">
            <ToggleSwitch
              checked={options.showPageNumbers}
              onChange={(v) => setOptions((o) => ({ ...o, showPageNumbers: v }))}
              label="Show page numbers"
            />
            <ToggleSwitch
              checked={options.showDate}
              onChange={(v) => setOptions((o) => ({ ...o, showDate: v }))}
              label="Show generation date"
            />
            <ToggleSwitch
              checked={options.includeCodeBackground}
              onChange={(v) => setOptions((o) => ({ ...o, includeCodeBackground: v }))}
              label="Include code block backgrounds"
            />
          </div>

          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Uses your browser's print dialog. Select "Save as PDF" as the destination.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={() => setExportModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
          >
            <FileDown size={14} />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}
