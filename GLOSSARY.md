# Farsi Inputs

A React playground for RTL, Persian-first input components. The domain is Persian typography conventions (Farsi digits, RTL layout) and preference-backed theming for form controls.

## Language

### Appearance & theming

**Theme**:
The resolved appearance of the whole page: `light` or `dark`. Resolved from the Theme preference; the System theme when no preference is stored.
_Avoid_: dark mode, skin, palette

**Theme preference**:
The user's stored choice: `light` or `dark`; absence means follow the System theme. System is the default state — never a stored value.
_Avoid_: saved theme, stored theme

**Theme picker**:
The control that exposes the Theme preference: روشن (light), تیره (dark), and سیستم (system). Choosing سیستم removes the preference rather than storing it.
_Avoid_: theme toggle, theme switcher, dark-mode button

**System theme**:
The device-reported appearance, exposed through `prefers-color-scheme`. The authority whenever no Theme preference exists; it never overrides an explicit preference.
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

### Date picking

**Jalali date**:
A date in the Solar Hijri calendar, held as a year, month, and day and shown with Persian digits as zero-padded `YYYY/MM/DD`.
_Avoid_: Persian date, Shamsi date

**Date picker**:
The composed control for choosing a Jalali date: a Date field that opens a calendar popover.
_Avoid_: date input, calendar widget

**Date field**:
The read-only display field of the Date picker. It shows the Selected date or the placeholder and never accepts typed text.
_Avoid_: input, text field

**Selected date**:
The Jalali date committed in the Date picker. Empty until a day is picked; held in component state only.
_Avoid_: picked date, value

**Viewed month**:
The Jalali month currently rendered in the Day grid. Opens at the Selected date's month, or Today's month when nothing is selected; year and month navigation change it without committing a date.
_Avoid_: current month, active month

**Today**:
The device-local current Jalali date, highlighted in the Day grid. Never stored.
_Avoid_: current date, now

**Day grid**:
The calendar grid of the Viewed month, read Saturday to Friday, with days outside the month blank.
_Avoid_: calendar, month view

**Year panel**:
The sub-panel for choosing a Jalali year. Choosing one updates the Viewed month's year and returns to the Day grid.
_Avoid_: year dropdown, year list

**Month panel**:
The sub-panel for choosing one of the twelve Jalali months. Choosing one updates the Viewed month and returns to the Day grid.
_Avoid_: month dropdown, month list
