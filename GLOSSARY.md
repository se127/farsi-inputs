# Farsi Inputs

A React playground for RTL, Persian-first input components. The domain is Persian typography conventions (Farsi digits, RTL layout) and system-driven theming for form controls.

## Language

### Appearance & theming

**Theme**:
The resolved appearance of the whole page: `light` or `dark`. In this project it always follows the device.
_Avoid_: dark mode, skin, palette

**System theme**:
The device-reported appearance, exposed to the page through `prefers-color-scheme`. The single authority for Theme; the page has no override of its own.
_Avoid_: OS setting, default theme

**`color-scheme`**:
The CSS property alone — how native form controls, scrollbars, and autofill chrome render. Kept hyphenated so it can never be confused with Theme.
_Avoid_: scheme

**Tailwind theme (`@theme`)**:
Tailwind's design-token namespace (fonts, colors, spacing). A distinct concept from Theme; never used when meaning the page's light/dark appearance.
_Avoid_: "theme" in unqualified speech about tokens

### Typeface

**Vazirmatn UI-FD-NL**:
The bundled variant of the Vazirmatn typeface: renders Farsi digits, contains no Latin glyphs — Latin script deliberately falls through the stack.
_Avoid_: bare "Vazirmatn" without naming the variant; "the font"

**Inter Variable**:
The bundled variable Latin face supplying Latin glyphs at any weight 100–900.
_Avoid_: Inter (which may also mean locally installed copies)

**Font stack**:
The ordered list of families a character resolves through zone by zone — Vazirmatn UI-FD-NL, Inter Variable, locally installed Inter, generic sans-serif.
_Avoid_: font family (singular; implies one face covers all glyphs)
