import { X } from 'lucide-react'
import { useAppStore, MarginPreset, PageSize } from '../store/useAppStore'

const BODY_FONTS = ['Georgia', 'Times New Roman', 'Cambria', 'Inter', 'Arial', 'Helvetica', 'system-ui']
const HEADING_FONTS = ['Georgia', 'Times New Roman', 'Cambria', 'Inter', 'Arial', 'Helvetica', 'system-ui']
const CODE_FONTS = ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace']

const MARGIN_PRESETS: { label: string; value: MarginPreset; mm: number }[] = [
  { label: 'Normal', value: 'normal', mm: 25 },
  { label: 'Narrow', value: 'narrow', mm: 12 },
  { label: 'Wide', value: 'wide', mm: 38 },
  { label: 'Custom', value: 'custom', mm: 0 },
]

const PAGE_SIZES: PageSize[] = ['A4', 'Letter', 'Legal', 'A5']

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-4 space-y-3">
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">
      {children}
    </p>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
      {children}
    </label>
  )
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, unit = '', onChange }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (v >= min && v <= max) onChange(v)
            }}
            className="w-12 text-right bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs tabular-nums font-medium text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
          />
          {unit && <span className="text-xs text-zinc-400 dark:text-zinc-600 w-4">{unit}</span>}
        </div>
      </div>
      <div className="relative h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-indigo-500"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

interface FontSelectProps {
  label: string
  value: string
  fonts: string[]
  customValue: string
  onSelect: (v: string) => void
  onCustom: (v: string) => void
  customPlaceholder: string
}

function FontSelect({ label, value, fonts, customValue, onSelect, onCustom, customPlaceholder }: FontSelectProps) {
  const displayFont = customValue || value
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={customValue ? '__custom__' : value}
        onChange={(e) => {
          if (e.target.value !== '__custom__') onSelect(e.target.value)
        }}
        style={{ fontFamily: displayFont }}
        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
      >
        {fonts.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
        {customValue && <option value="__custom__">{customValue}</option>}
      </select>
      <input
        type="text"
        placeholder={customPlaceholder}
        value={customValue}
        onChange={(e) => onCustom(e.target.value)}
        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder-zinc-300 dark:placeholder-zinc-600 transition-colors"
      />
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
          checked ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

function MarginInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">{label}</span>
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors tabular-nums"
      />
      <span className="text-[10px] text-zinc-300 dark:text-zinc-700">mm</span>
    </div>
  )
}

export default function SettingsPanel() {
  const { typography, setTypography, setSettingsPanelOpen } = useAppStore()

  function applyMarginPreset(preset: MarginPreset) {
    const presetData = MARGIN_PRESETS.find((p) => p.value === preset)
    if (!presetData || preset === 'custom') {
      setTypography({ marginPreset: 'custom' })
      return
    }
    setTypography({
      marginPreset: preset,
      marginTop: presetData.mm,
      marginRight: presetData.mm,
      marginBottom: presetData.mm,
      marginLeft: presetData.mm,
    })
  }

  return (
    <div className="w-screen sm:w-72 flex-shrink-0 h-full flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-zinc-900">
        <div>
          <h2 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Typography</h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">Preview & PDF settings</p>
        </div>
        <button
          onClick={() => setSettingsPanelOpen(false)}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          title="Close settings"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* Fonts */}
        <div>
          <SectionLabel>Fonts</SectionLabel>
          <SectionCard>
            <FontSelect
              label="Body"
              value={typography.bodyFont}
              fonts={BODY_FONTS}
              customValue={typography.customBodyFont}
              onSelect={(v) => setTypography({ bodyFont: v, customBodyFont: '' })}
              onCustom={(v) => setTypography({ customBodyFont: v })}
              customPlaceholder="Custom body font…"
            />
            <div className="border-t border-zinc-100 dark:border-zinc-700/50" />
            <FontSelect
              label="Heading"
              value={typography.headingFont}
              fonts={HEADING_FONTS}
              customValue={typography.customHeadingFont}
              onSelect={(v) => setTypography({ headingFont: v, customHeadingFont: '' })}
              onCustom={(v) => setTypography({ customHeadingFont: v })}
              customPlaceholder="Custom heading font…"
            />
            <div className="border-t border-zinc-100 dark:border-zinc-700/50" />
            <div className="space-y-1.5">
              <FieldLabel>Code</FieldLabel>
              <select
                value={typography.codeFont}
                onChange={(e) => setTypography({ codeFont: e.target.value })}
                style={{ fontFamily: typography.codeFont }}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-800 dark:text-zinc-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
              >
                {CODE_FONTS.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                ))}
              </select>
            </div>
          </SectionCard>
        </div>

        {/* Size & Spacing */}
        <div>
          <SectionLabel>Size & Spacing</SectionLabel>
          <SectionCard>
            {/* Presets */}
            <div className="grid grid-cols-3 gap-1 pb-2 border-b border-zinc-100 dark:border-zinc-700/50">
              {[
                { label: 'Compact', fs: 10, lh: 1.2, ps: 4 },
                { label: 'Default', fs: 12, lh: 1.5, ps: 12 },
                { label: 'Relaxed', fs: 14, lh: 1.8, ps: 20 },
              ].map((preset) => {
                const active = typography.fontSize === preset.fs && typography.lineHeight === preset.lh && typography.paragraphSpacing === preset.ps
                return (
                  <button
                    key={preset.label}
                    onClick={() => setTypography({ fontSize: preset.fs, lineHeight: preset.lh, paragraphSpacing: preset.ps })}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
            <SliderRow
              label="Font Size"
              value={typography.fontSize}
              min={10} max={24} step={1} unit="pt"
              onChange={(v) => setTypography({ fontSize: v })}
            />
            <SliderRow
              label="Line Height"
              value={typography.lineHeight}
              min={1.0} max={2.5} step={0.1}
              onChange={(v) => setTypography({ lineHeight: Number(v.toFixed(1)) })}
            />
            <SliderRow
              label="Paragraph Spacing"
              value={typography.paragraphSpacing}
              min={0} max={24} step={1} unit="px"
              onChange={(v) => setTypography({ paragraphSpacing: v })}
            />
          </SectionCard>
        </div>

        {/* Page */}
        <div>
          <SectionLabel>Page</SectionLabel>
          <SectionCard>
            {/* Page size */}
            <div className="space-y-1.5">
              <FieldLabel>Size</FieldLabel>
              <div className="grid grid-cols-4 gap-1">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setTypography({ pageSize: size })}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      typography.pageSize === size
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin presets */}
            <div className="space-y-1.5">
              <FieldLabel>Margins</FieldLabel>
              <div className="grid grid-cols-4 gap-1">
                {MARGIN_PRESETS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => applyMarginPreset(value)}
                    className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      typography.marginPreset === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin cross layout */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <MarginInput label="Top" value={typography.marginTop}
                onChange={(v) => setTypography({ marginTop: v, marginPreset: 'custom' })} />
              <div className="flex items-center gap-2">
                <MarginInput label="Left" value={typography.marginLeft}
                  onChange={(v) => setTypography({ marginLeft: v, marginPreset: 'custom' })} />
                {/* Page thumbnail */}
                <div
                  className="w-10 h-14 rounded border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0"
                  style={{
                    boxShadow: `inset ${Math.max(2, typography.marginLeft / 8)}px ${Math.max(2, typography.marginTop / 8)}px 0 0 #e0e7ff,
                                inset -${Math.max(2, typography.marginRight / 8)}px -${Math.max(2, typography.marginBottom / 8)}px 0 0 #e0e7ff`
                  }}
                />
                <MarginInput label="Right" value={typography.marginRight}
                  onChange={(v) => setTypography({ marginRight: v, marginPreset: 'custom' })} />
              </div>
              <MarginInput label="Bottom" value={typography.marginBottom}
                onChange={(v) => setTypography({ marginBottom: v, marginPreset: 'custom' })} />
            </div>
          </SectionCard>
        </div>

        {/* Preview */}
        <div>
          <SectionLabel>Preview</SectionLabel>
          <SectionCard>
            <Toggle
              label="Dark preview background"
              checked={typography.previewDark}
              onChange={(v) => setTypography({ previewDark: v })}
            />
          </SectionCard>
        </div>

      </div>
    </div>
  )
}
