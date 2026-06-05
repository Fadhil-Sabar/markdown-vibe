# Landscape Orientation Feature — Test Case Document

## Test Environment
- **Browser**: Chromium (HeadlessChrome) via Hermes Agent browser tool
- **App URL**: http://localhost:5173 (dev) / https://markdown-vibe.pages.dev (production)
- **Device**: Linux x86_64, 1280×577 viewport
- **Build**: TypeScript + Vite + React 18

---

## TC-1: UI Control Visibility

| Field | Value |
|---|---|
| **ID** | TC-1 |
| **Description** | Verify the landscape/portrait orientation toggle exists in the settings panel |
| **Precondition** | App loaded, settings panel closed |
| **Steps** | 1. Click Settings (⚙️) button in toolbar. 2. Scroll down to PAGE section. |
| **Expected** | ORIENTATION subsection visible with two buttons: "Portrait" and "Landscape". One is highlighted (active). |
| **Actual** | PASS. Both buttons present under PAGE > ORIENTATION. Active selection highlighted in indigo. |
| **Screenshot** | `screenshot_settings_panel.png` |

---

## TC-2: Orientation Switch — Portrait → Landscape

| Field | Value |
|---|---|
| **ID** | TC-2 |
| **Description** | Clicking "Landscape" changes the page dimensions to width > height |
| **Precondition** | Settings panel open, Portrait selected, print preview mode ON |
| **Steps** | 1. Click "Landscape" button. 2. Verify the page thumbnail becomes wider-than-tall. 3. Check computed dimensions via JS. |
| **Expected** | Layout switches to landscape: width > height (e.g., A4 → 297mm × 210mm) |
| **Actual** | PASS. JS confirmed `width: 297mm, minHeight: 210mm` for A4 landscape. Page thumbnail shows wide rectangle. |
| **Screenshot** | `screenshot_landscape_preview.png` |

---

## TC-3: Print Preview Shows Landscape Layout

| Field | Value |
|---|---|
| **ID** | TC-3 |
| **Description** | Print preview mode applies landscape dimensions to the simulated page |
| **Precondition** | Landscape selected, print preview ON (Printer icon active) |
| **Steps** | 1. Toggle print preview mode by clicking Printer icon. 2. Inspect DOM for page container dimensions. |
| **Expected** | The preview page container uses landscape dimensions (e.g., 297mm wide) |
| **Actual** | PASS. Print preview shows white page with landscape proportions. JS returns `width: 297mm, minHeight: 210mm`. |
| **Screenshot** | `screenshot_print_preview_landscape.png` |

---

## TC-4: Print Output — PDF Export CSS

| Field | Value |
|---|---|
| **ID** | TC-4 |
| **Description** | The `@page` CSS rule includes `landscape` keyword for printing |
| **Precondition** | Landscape selected |
| **Steps** | 1. Open Export PDF modal. 2. Verify summary shows "Landscape". 3. Verify `buildPageRule()` generates correct CSS. |
| **Expected** | @page rule contains `size: <dimensions> landscape;`. PDF modal shows orientation. |
| **Actual** | PASS. Summary shows `A4 · Landscape · 25/25/25/25mm · Georgia 12pt`. Unit test verifies CSS output: `@page { size: 210mm 297mm landscape; }`. |
| **Evidence** | Unit test `exportPDF.test.ts` — TC-L1 through TC-L6. Export modal screenshot. |

> **Note**: window.print() opens a native OS print dialog which cannot be rendered in a headless Chromium session for screenshot capture. The `@page` CSS injection is verified via unit tests (13/13 passing) and DOM inspection of the dynamically generated styles.

---

## TC-5: Toggle Back — Landscape → Portrait

| Field | Value |
|---|---|
| **ID** | TC-5 |
| **Description** | Switching back to Portrait restores original layout without errors |
| **Precondition** | Landscape selected, print preview ON |
| **Steps** | 1. Click "Portrait" button. 2. Verify dimensions revert to portrait. 3. Check console for errors. |
| **Expected** | Page dimensions return to portrait (210mm × 297mm for A4). No console errors. |
| **Actual** | PASS. JS confirmed `width: 210mm, minHeight: 297mm`. Zero console errors. |
| **Screenshot** | `screenshot_portrait_restored.png` |

---

## TC-6: Cross-Browser Compatibility

| Field | Value |
|---|---|
| **ID** | TC-6 |
| **Description** | Feature works across multiple browsers |
| **Precondition** | — |
| **Steps** | Test in available browser engines |
| **Expected** | Feature works identically |
| **Actual** | **PARTIAL** — Only Chromium available in test environment. The feature uses standard CSS `@page { size: ... landscape; }` which is supported in Chrome, Firefox, Safari, and Edge. Standard React/TypeScript code has no browser-specific logic. No browser prefixes used. |
| **Note** | CSS `size` property is part of CSS Paged Media Module, supported by all modern browsers. The `window.print()` API is universal. No vendor-specific code. |

---

## TC-7: Mobile Viewport (≤768px)

| Field | Value |
|---|---|
| **ID** | TC-7 |
| **Description** | App and landscape feature work on mobile viewports |
| **Precondition** | — |
| **Steps** | 1. Check viewport meta tag. 2. Check responsive CSS classes. 3. Verify settings panel accessible. |
| **Expected** | Viewport meta set. Responsive breakpoints used. Settings panel with orientation toggle accessible. |
| **Actual** | PASS. Viewport meta: `width=device-width, initial-scale=1.0`. App uses Tailwind `sm:` breakpoints for responsive layout. Settings panel uses `w-screen sm:w-72` making it full-width on mobile. Orientation buttons are standard `<button>` elements that render on any viewport. |
| **Note** | Actual mobile device testing not possible in this environment, but responsive architecture confirmed. |

---

## TC-8: Content Integrity

| Field | Value |
|---|---|
| **ID** | TC-8 |
| **Description** | All content remains visible and readable in landscape mode |
| **Precondition** | App loaded with welcome markdown content |
| **Steps** | 1. Toggle to landscape. 2. Enable print preview. 3. Verify all text, tables, code blocks, math render correctly. |
| **Expected** | No text truncation, overlapping, or horizontal scrollbars required for content |
| **Actual** | PASS. All content rendered correctly. Markdown elements (headings, lists, tables, code blocks, math) display properly. Content wraps naturally within landscape page dimensions. |
| **Screenshot** | `screenshot_landscape_content.png` |

---

## TC-9: Rapid Switching

| Field | Value |
|---|---|
| **ID** | TC-9 |
| **Description** | Rapidly toggling between orientations does not cause layout corruption |
| **Precondition** | Settings panel open |
| **Steps** | 1. Click Landscape/Portrait alternately 10 times. 2. End on Landscape. 3. Check dimensions. 4. Check console. |
| **Expected** | Final state is correct (Landscape). No console errors. No layout corruption. |
| **Actual** | PASS. After 5 rapid cycles, end state is Landscape. Dimensions correct (`297mm × 210mm`). Zero console errors. Layout intact. |

---

## TC-10: Existing Portrait Mode

| Field | Value |
|---|---|
| **ID** | TC-10 |
| **Description** | Existing portrait/normal mode continues to work |
| **Precondition** | App freshly loaded (default = portrait) |
| **Steps** | 1. Load app (should default to Portrait). 2. Verify dimensions. 3. Switch to Landscape. 4. Switch back. |
| **Expected** | Default orientation is Portrait. Switching back to Portrait restores original dimensions. |
| **Actual** | PASS. Default landscape=false. Portrait dimensions: `210mm × 297mm`. Toggle round-trip: Portrait→Landscape→Portrait works. No errors. |

---

## TC-11: Print CSS @media print

| Field | Value |
|---|---|
| **ID** | TC-11 |
| **Description** | CSS `@media print` rules respect landscape setting |
| **Precondition** | Landscape selected |
| **Steps** | 1. Check `buildPrintCSS()` output includes landscape orientation. 2. Verify `print.css` doesn't override orientation. |
| **Expected** | The dynamically generated print CSS includes `@page { size: ... landscape; }`. |
| **Actual** | PASS. `buildPageRule()` generates `@page { size: 210mm 297mm landscape; }` when landscape=true. `print.css` does not contain any `size` override — it only handles page-break behavior and link URL expansion, which are orientation-agnostic. |

---

## TC-12: No JS Console Errors

| Field | Value |
|---|---|
| **ID** | TC-12 |
| **Description** | No JavaScript errors during any landscape feature interaction |
| **Precondition** | App loaded |
| **Steps** | 1. Toggle portrait→landscape. 2. Toggle print preview. 3. Toggle landscape→portrait. 4. Open export modal. 5. Check console. |
| **Expected** | Zero console errors or warnings |
| **Actual** | PASS. Console clean across all interactions. |

---

## Summary

| TC-ID | Description | Result | Evidence |
|---|---|---|---|
| TC-1 | UI toggle exists | ✅ PASS | Screenshot: settings panel |
| TC-2 | Landscape switch works | ✅ PASS | JS: 297mm×210mm |
| TC-3 | Print preview landscape | ✅ PASS | DOM inspection + screenshot |
| TC-4 | Print output CSS | ✅ PASS | Unit tests + modal screenshot |
| TC-5 | Toggle back (landscape→portrait) | ✅ PASS | JS: 210mm×297mm |
| TC-6 | Cross-browser | ⚠️ PARTIAL | Only Chromium available; uses standard CSS |
| TC-7 | Mobile viewport | ✅ PASS | Viewport meta + responsive classes |
| TC-8 | Content integrity | ✅ PASS | All content renders correctly |
| TC-9 | Rapid switching | ✅ PASS | 5 cycles, no errors |
| TC-10 | Existing portrait works | ✅ PASS | Default + round-trip verified |
| TC-11 | @media print respects landscape | ✅ PASS | Dynamic CSS includes landscape |
| TC-12 | No console errors | ✅ PASS | Zero errors throughout |

**Overall: 11/12 PASS, 1/12 PARTIAL (cross-browser — limited to Chromium)**
