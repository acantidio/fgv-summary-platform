# Design System Reference

The visual design is inherited from the original `estrategia-corporativa` site. All styling lives inline in `build.js` as CSS template literals inside `sharedCSS()`, `renderSubjectPage()`, and `renderHubPage()`.

---

## Typography

| Role | Font family | CSS variable |
|---|---|---|
| Display (headings, card titles) | DM Serif Display | `var(--font-display)` |
| Body | DM Sans | `var(--font-body)` |
| Mono (labels, badges, code) | JetBrains Mono | `var(--font-mono)` |

Loaded via Google Fonts in `sharedCSS()`.

---

## Color Palette

### Base palette (CSS variables)

| Variable | Hex | Used for |
|---|---|---|
| `--bg` | `#FAF9F6` | Page background |
| `--bg-card` | `#FFFFFF` | Card and header backgrounds |
| `--bg-surface` | `#F3F1EC` | Code blocks, subtle surfaces |
| `--text-primary` | `#1A1A18` | Main body text |
| `--text-secondary` | `#5C5B56` | Card descriptions, secondary text |
| `--text-tertiary` | `#8A8985` | Labels, back links, badges |
| `--border` | `#DDD9D0` | Card borders on hover |
| `--border-light` | `#ECEAE4` | Default card borders, section dividers |

### Accent colors (per-subject, hardcoded in `ACCENT` object in `build.js`)

| Key | Light bg | Main color | Status badge, top border |
|---|---|---|---|
| `purple` | `#EEEDFE` | `#534AB7` | ✓ |
| `amber` | `#FAEEDA` | `#854F0B` | ✓ |
| `teal` | `#E6F4F1` | `#0F6E56` | ✓ |
| `blue` | `#EBF5FF` | `#1A56DB` | ✓ |
| `rose` | `#FDE8EC` | `#C81E3A` | ✓ |

Adding a new color: add an entry to the `ACCENT` object in `build.js` and add the value to `VALID_COLORS` in `test.js`.

---

## Responsive Breakpoints

Three breakpoints, no framework:

| Breakpoint | Width | Layout changes |
|---|---|---|
| Desktop | `> 640px` | Hub: 2-column grid, larger padding |
| Mobile | `≤ 640px` | Hub: single column, reduced padding, smaller h1 |

The `640px` breakpoint handles both mobile and tablet in a single rule — anything under that width goes single-column.

---

## Component Reference

### Hub card (`.card`)

```
┌─────────────────────────────────┐  ← 4px top border in accent.main
│ [BADGE]  Em andamento           │  ← badge: mono 10px, accent.light bg
│                                 │
│ Subject Title                   │  ← DM Serif Display 20px
│ Description text here...        │  ← DM Sans 13px, text-secondary
└─────────────────────────────────┘
```

Hover: lifts 2px, shadow deepens, border darkens.

### Subject header (`.subject-header`)

```
┌─────────────────────────────────┐  ← 4px top border in accent.main
│ [BADGE]  Concluído              │
│                                 │
│ Full Subject Title              │  ← DM Serif Display clamp(24px, 4vw, 36px)
└─────────────────────────────────┘
```

### Content typography hierarchy

```
## Section          → DM Serif Display 22px, border-bottom
### Sub-section     → DM Sans 15px bold
#### Label          → DM Sans 13px bold, uppercase, text-secondary
```

### Callout components (`.callout`)

Rendered from `> [!TYPE]` syntax in enriched content files. Four variants:

| Class | Background | Left border | Label color | Purpose |
|---|---|---|---|---|
| `.callout-summary` | `var(--bg-surface)` | `var(--text-secondary)` | `var(--text-secondary)` | ◎ Resumo — cheat-sheet at top |
| `.callout-exam` | `#FEF9EC` | `#D97706` | `#92400E` | ⚠ Cai na Prova — exam alert |
| `.callout-key` | `#EEEDFE` | `#534AB7` | `#3730A3` | ◆ Conceito-Chave — key concept |
| `.callout-recall` | `#E6F4F1` | `#0F6E56` | `#065F46` | ? Recall Ativo — self-test question |

```
┌────────────────────────────────────┐  ← 3px left border in variant color
│ ⚠ CAI NA PROVA                     │  ← .callout-label: mono 10px, uppercase
│                                    │
│ Body text rendered from markdown.  │  ← .callout-body: 1.75 line-height
└────────────────────────────────────┘
```

CSS is in the `<style>` block inside `renderSubjectPage()` in `build.js`.

---

## Modifying the Design

All CSS is in `build.js`. To make a global change (e.g., change the font size or add a new component):

1. Edit `sharedCSS()` for changes that apply to both hub and subject pages
2. Edit the `<style>` block inside `renderSubjectPage()` for subject-page-only changes
3. Edit the `<style>` block inside `renderHubPage()` for hub-page-only changes
4. Run `npm run build` to regenerate all pages
5. Run `open docs/index.html` to verify visually

No CSS preprocessor, no build step beyond `node build.js`.
