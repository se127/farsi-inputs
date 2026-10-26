# AGENTS.md

Persian RTL input components playground. Vite 8 + React 19 (React Compiler) + Tailwind CSS 4 + oxlint + Prettier — exact pins live in `package.json`. Canonical vocabulary lives in `GLOSSARY.md`; consult it before coining terms in code or prose.

## Comment-free code

Keep every authored file free of code comments — line comments and block comments alike. If code needs explaining: rename, restructure, or relocate the rationale here or into `GLOSSARY.md`. Enforcement is partial: oxlint blocks same-line comments (`no-inline-comments`); standalone block comments rely on this file — treat it as a hard rule.

## Conventions

The why behind choices that no config file confesses. Every item here was a decision; treat edits to them as decisions, not edits.

- **Font wiring lives entirely in `src/index.css`**; `src/main.tsx` boots React only. The stack order `'Vazirmatn', 'Inter Variable', 'Inter', sans-serif` is load-bearing: the Vazirmatn UI-FD-NL variant has no Latin glyphs, so Latin text and digits fall through per glyph to Inter Variable, then locally installed Inter. Never reorder it; never move wiring into JS.
- **`src/font/vazirmatn/` is a verbatim byte-level vendor copy** from the owner's Desktop font folder. Never edit, format, or lint it; adding weights is a re-copy, not a regeneration. `.prettierignore` enforces the format side.
- **`tailwindStylesheet` in `.prettierrc.json` must keep pointing at `src/index.css`** — prettier-plugin-tailwindcss requires the Tailwind v4 stylesheet entry point for class sorting.
- **Theming is system preference only** (`prefers-color-scheme`): no toggle, no stored state. Keep `color-scheme: light dark` beside the html background pair (white light / zinc-900 dark) so native form controls and scrollbars match the page theme.
- **Dist is the only css witness**: a green `bun run build` proves nothing about css — a css file not imported anywhere is silently invisible, and theme variables only emit when referenced. After any css change, read the compiled `dist/assets/*.css` before declaring the work done.
