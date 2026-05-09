import { TypographySettings } from '../store/useAppStore'

export interface PDFExportOptions {
  headerText: string
  footerText: string
  showPageNumbers: boolean
  showDate: boolean
  includeCodeBackground: boolean
}

/**
 * Extract H1 title from rendered HTML for default filename.
 */
export function extractTitle(html: string): string {
  const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i)
  if (!match) return 'untitled'
  return match[1].replace(/<[^>]+>/g, '').trim() || 'untitled'
}

/**
 * Build the @page CSS rule from typography settings.
 * margin values are in mm.
 */
function buildPageRule(t: TypographySettings, options: PDFExportOptions): string {
  const pageSizes: Record<string, string> = {
    A4: '210mm 297mm',
    Letter: '8.5in 11in',
    Legal: '8.5in 14in',
    A5: '148mm 210mm',
  }
  const size = pageSizes[t.pageSize] || '210mm 297mm'
  const margin = `${t.marginTop}mm ${t.marginRight}mm ${t.marginBottom}mm ${t.marginLeft}mm`

  let headerContent = options.headerText
    ? `"${options.headerText.replace('{title}', document.title)}"`
    : 'none'
  let footerContent = 'none'

  if (options.footerText || options.showPageNumbers) {
    const text = options.footerText
      .replace('{page}', 'counter(page)')
      .replace('{total}', 'counter(pages)')
    footerContent = text ? `"${text}"` : `counter(page)`
  }

  return `
    @page {
      size: ${size};
      margin: ${margin};
      @top-center { content: ${headerContent}; font-size: 9pt; color: #666; }
      @bottom-center { content: ${footerContent}; font-size: 9pt; color: #666; }
    }
  `
}

/**
 * Build complete print stylesheet that mirrors the preview appearance.
 * This is injected into the page just before window.print() and removed after.
 */
function buildPrintCSS(t: TypographySettings, options: PDFExportOptions): string {
  const bodyFont = t.customBodyFont || t.bodyFont
  const headingFont = t.customHeadingFont || t.headingFont
  const codeFont = t.codeFont
  const dateStr = options.showDate
    ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return `
    ${buildPageRule(t, options)}

    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: "${bodyFont}", Georgia, serif;
      font-size: ${t.fontSize}pt;
      line-height: ${t.lineHeight};
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: "${headingFont}", Georgia, serif;
      color: #000;
      page-break-after: avoid;
    }
    h1 { font-size: ${t.fontSize * 2}pt; }
    h2 { font-size: ${t.fontSize * 1.5}pt; }
    h3 { font-size: ${t.fontSize * 1.17}pt; }

    p { margin-bottom: ${t.paragraphSpacing}px; }

    pre, code {
      font-family: "${codeFont}", "Courier New", monospace;
      font-size: ${t.fontSize * 0.9}pt;
      ${options.includeCodeBackground
        ? 'background: #f5f5f5; border: 1px solid #ddd;'
        : 'background: transparent; border: 1px solid #ddd;'}
    }
    pre {
      padding: 8pt;
      white-space: pre-wrap;
      word-break: break-word;
    }

    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #999; padding: 4pt 8pt; }
    th { background: #f0f0f0; }

    blockquote {
      border-left: 3px solid #999;
      padding-left: 12pt;
      color: #444;
      margin-left: 0;
    }

    img { max-width: 100%; }
    a { color: #000; text-decoration: underline; }
    .page-break { page-break-before: always; }
    .katex-display { page-break-inside: avoid; }

    ${dateStr ? `body::before { content: "${dateStr}"; display: block; text-align: right; font-size: 9pt; color: #666; margin-bottom: 12pt; }` : ''}
  `
}

export function triggerPrint(
  previewHtml: string,
  typography: TypographySettings,
  options: PDFExportOptions
): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return

  const katexCSS = previewHtml.includes('katex')
    ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">`
    : ''

  // Copy highlight.js styles from the current page so code blocks render correctly
  const hlStyles = Array.from(document.styleSheets)
    .filter(s => { try { return !!s.cssRules } catch { return false } })
    .flatMap(s => Array.from(s.cssRules))
    .filter(r => r.cssText.includes('.hljs'))
    .map(r => r.cssText)
    .join('\n')

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  ${katexCSS}
  <style>${hlStyles}\n${buildPrintCSS(typography, options)}</style>
</head>
<body>${previewHtml}</body>
</html>`)
  printWindow.document.close()

  // Wait for external resources (KaTeX CSS) before printing
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}
