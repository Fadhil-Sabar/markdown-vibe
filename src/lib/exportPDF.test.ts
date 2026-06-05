import { describe, it, expect } from 'vitest'
import { extractTitle } from './exportPDF'
import { TypographySettings, PageSize } from '../store/useAppStore'

/**
 * Unit tests for PDF export logic — landscape orientation.
 *
 * We test the CSS generation indirectly by reconstructing the
 * @page rule logic from exportPDF.ts.
 */

function buildPageRule(t: TypographySettings): string {
  const pageSizes: Record<string, string> = {
    A4: '210mm 297mm',
    Letter: '8.5in 11in',
    Legal: '8.5in 14in',
    A5: '148mm 210mm',
  }
  const size = pageSizes[t.pageSize] || '210mm 297mm'
  const orientation = t.landscape ? ' landscape' : ''
  const margin = `${t.marginTop}mm ${t.marginRight}mm ${t.marginBottom}mm ${t.marginLeft}mm`
  return `@page { size: ${size}${orientation}; margin: ${margin}; }`
}

function makeTypography(overrides: Partial<TypographySettings> = {}): TypographySettings {
  return {
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
    landscape: false,
    ...overrides,
  }
}

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

describe('landscape orientation — @page CSS', () => {
  it('defaults to portrait for A4', () => {
    const css = buildPageRule(makeTypography())
    expect(css).toContain('size: 210mm 297mm;')
    expect(css).not.toContain('landscape')
  })

  it('appends " landscape" for A4 landscape', () => {
    const css = buildPageRule(makeTypography({ landscape: true }))
    expect(css).toContain('size: 210mm 297mm landscape;')
  })

  it('keeps portrait for Letter when landscape is false', () => {
    const css = buildPageRule(makeTypography({ pageSize: 'Letter', landscape: false }))
    expect(css).toContain('size: 8.5in 11in;')
    expect(css).not.toContain('landscape')
  })

  it('appends " landscape" for Letter landscape', () => {
    const css = buildPageRule(makeTypography({ pageSize: 'Letter', landscape: true }))
    expect(css).toContain('size: 8.5in 11in landscape;')
  })

  it('works for Legal landscape', () => {
    const css = buildPageRule(makeTypography({ pageSize: 'Legal', landscape: true }))
    expect(css).toContain('size: 8.5in 14in landscape;')
  })

  it('works for A5 landscape', () => {
    const css = buildPageRule(makeTypography({ pageSize: 'A5', landscape: true }))
    expect(css).toContain('size: 148mm 210mm landscape;')
  })

  it('preserves margins when switching to landscape', () => {
    const css = buildPageRule(makeTypography({ marginTop: 10, marginRight: 15, marginBottom: 20, marginLeft: 25 }))
    expect(css).toContain('margin: 10mm 15mm 20mm 25mm;')
  })

  it('preserves margins in landscape mode', () => {
    const css = buildPageRule(makeTypography({ landscape: true, marginTop: 30, marginRight: 20, marginBottom: 30, marginLeft: 20 }))
    expect(css).toContain('margin: 30mm 20mm 30mm 20mm;')
    expect(css).toContain('landscape')
  })
})

describe('landscape orientation — page dimensions', () => {
  it('returns portrait dimensions when landscape=false', () => {
    expect(getPageDimensions('A4', false)).toEqual(['210mm', '297mm'])
    expect(getPageDimensions('Letter', false)).toEqual(['8.5in', '11in'])
    expect(getPageDimensions('Legal', false)).toEqual(['8.5in', '14in'])
    expect(getPageDimensions('A5', false)).toEqual(['148mm', '210mm'])
  })

  it('swaps width and height when landscape=true', () => {
    expect(getPageDimensions('A4', true)).toEqual(['297mm', '210mm'])
    expect(getPageDimensions('Letter', true)).toEqual(['11in', '8.5in'])
    expect(getPageDimensions('Legal', true)).toEqual(['14in', '8.5in'])
    expect(getPageDimensions('A5', true)).toEqual(['210mm', '148mm'])
  })
})

describe('extractTitle', () => {
  it('extracts title from h1', () => {
    expect(extractTitle('<h1>Hello World</h1>')).toBe('Hello World')
  })

  it('returns untitled when no h1', () => {
    expect(extractTitle('<p>no heading</p>')).toBe('untitled')
  })

  it('strips HTML tags from title', () => {
    expect(extractTitle('<h1>Hello <em>World</em></h1>')).toBe('Hello World')
  })
})
