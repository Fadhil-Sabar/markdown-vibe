import DOMPurify from 'dompurify'

// Allow KaTeX-generated elements and classes, plus standard HTML
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mspace', 'mtext'],
    ADD_ATTR: ['class', 'style', 'aria-hidden', 'focusable', 'role', 'xmlns'],
    FORCE_BODY: false,
  }) as string
}
