import { useRef, useEffect } from 'react'
import { useMarkdownParser } from '../hooks/useMarkdownParser'
import { useAppStore, PageSize } from '../store/useAppStore'
import '../styles/preview.css'

/** Get page dimensions for print preview. Returns [width, height] in mm or in. */
function getPageDimensions(size: PageSize, landscape: boolean): [string, string] {
  const dims: Record<PageSize, [string, string]> = {
    A4: ['210mm', '297mm'],
    Letter: ['8.5in', '11in'],
    Legal: ['8.5in', '14in'],
    A5: ['148mm', '210mm'],
  }
  const [w, h] = dims[size]
  return landscape ? [h, w] : [w, h]
}

interface PreviewProps {
  className?: string
}

export default function Preview({ className = '' }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { content, typography, printPreviewMode } = useAppStore()
  const html = useMarkdownParser(content)

  const bodyFont = typography.customBodyFont || typography.bodyFont
  const headingFont = typography.customHeadingFont || typography.headingFont
  const codeFont = typography.codeFont

  // Inject dynamic typography CSS variables
  const previewStyle: React.CSSProperties = {
    fontFamily: `"${bodyFont}", Georgia, serif`,
    fontSize: `${typography.fontSize}pt`,
    lineHeight: typography.lineHeight,
  }

  // In print-preview mode, simulate the page with margins
  const [pageW, pageH] = getPageDimensions(typography.pageSize, typography.landscape)
  const printPageStyle: React.CSSProperties = printPreviewMode
    ? {
        paddingTop: `${typography.marginTop}mm`,
        paddingRight: `${typography.marginRight}mm`,
        paddingBottom: `${typography.marginBottom}mm`,
        paddingLeft: `${typography.marginLeft}mm`,
        background: '#fff',
        color: '#000',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.15)',
        minHeight: pageH,
        width: pageW,
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative' as const,
      }
    : {}

  // Heading font is applied via a <style> tag injection
  const headingCss = `
    .preview-content h1,
    .preview-content h2,
    .preview-content h3,
    .preview-content h4,
    .preview-content h5,
    .preview-content h6 {
      font-family: "${headingFont}", Georgia, serif;
    }
    .preview-content code,
    .preview-content pre,
    .preview-content pre code {
      font-family: "${codeFont}", "Courier New", monospace;
    }
    .preview-content p {
      margin-bottom: ${typography.paragraphSpacing}px;
    }
  `

  // Load KaTeX CSS when needed
  useEffect(() => {
    if (html.includes('katex')) {
      const id = 'katex-preview-css'
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css'
        document.head.appendChild(link)
      }
    }
  }, [html])

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-auto ${printPreviewMode ? 'bg-zinc-200 dark:bg-zinc-700 p-8' : 'p-0'} ${className}`}
    >
      <style>{headingCss}</style>
      <div className={printPreviewMode ? 'overflow-x-auto' : 'h-full'}>
      <div style={printPageStyle} className={printPreviewMode ? '' : 'h-full'}>
        {html ? (
          <div
            className={`preview-content ${printPreviewMode ? 'print-preview-mode' : 'px-4 py-4 sm:px-8 sm:py-6'}`}
            style={previewStyle}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-zinc-300 dark:text-zinc-600 text-base italic select-none">
              Start typing to see your preview here…
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
