# FGV MBA Summary Platform — Claude Instructions

## What This Project Is

A personal learning platform for André's FGV MBA in Management (Gestão Empresarial). Notes are written in Obsidian and compiled into a static HTML site served on GitHub Pages. One new subject is added approximately every month.

**Live site:** `https://acantidio.github.io/fgv-summary-platform/`
**GitHub repo:** `https://github.com/acantidio/fgv-summary-platform`
**Obsidian vault:** `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/`

---

## The Primary Recurring Task: Adding a New Subject

This will happen every month. When André says something like "I finished class X, add it to the platform", follow this exact flow:

### 1. Find the Obsidian note

```bash
ls "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/"
```

Read the relevant `.md` file. The content starts immediately — no frontmatter in Obsidian files.

### 2. Create the content file

Create `content/[slug].md` with frontmatter + the Obsidian content as the body.

**Frontmatter template:**
```markdown
---
title: Full Subject Name in Portuguese
slug: lowercase-kebab-case
description: One sentence summary of what this subject covers.
status: complete        # complete | in-progress | pending
color: purple           # purple | amber | teal | blue | rose — pick one not overused
---

[Obsidian content here]
```

**Rules:**
- `slug` must be unique and URL-safe (no accents, lowercase, hyphens only)
- `color` — pick one that isn't already used by too many subjects. Check `content/` to see current distribution.
- `status: in-progress` if notes are incomplete; `complete` if the class is fully documented.
- Do NOT add a frontmatter section to the Obsidian content — paste it verbatim below the `---` closing.

**Current color assignments:**
| Color | Subject |
|---|---|
| purple | Estratégia Corporativa |
| teal | Gestão de Serviços |
| blue | Transformação Digital |
| amber | Análise de Demonstrativos Contábeis |
| rose | (available) |

Rotate through colors; each new subject gets the next available or least-used color.

### 3. Handle Obsidian-specific syntax

Obsidian notes may contain:
- `[[wikilinks]]` — strip the brackets, leave the text: `[[Estratégia]]` → `Estratégia`
- `![[embedded files]]` — remove entirely
- `---` horizontal rules — render fine, keep them
- Tab-indented nested lists — `marked` handles these correctly, no changes needed

### 4. Run tests and build

```bash
npm test          # Must pass before committing
npm run build     # Generates docs/ output
```

If the frontmatter test fails, check that `status` and `color` are valid values (see above).

### 5. Open locally to verify

```bash
open docs/index.html
```

Verify the new card appears on the hub with correct title, color badge, and description. Click through to the subject page and check the content renders correctly.

### 6. Commit and push

```bash
git add content/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions will run tests, rebuild, and re-deploy automatically. The live site updates within ~2 minutes.

---

## Commands

| Command | Purpose |
|---|---|
| `npm test` | Run all 5 tests |
| `npm run build` | Generate `docs/` from `content/` |
| `node build.js` | Same as build |
| `open docs/index.html` | Preview locally |

---

## Architecture at a Glance

```
content/[slug].md                        ← Obsidian note + frontmatter (edit here)
complementary-study-docs/[slug]/         ← PDFs, slides, books per subject (dump files here)
build.js                                 ← Full pipeline: read → render → write docs/
test.js                                  ← 5 tests covering content, parse, render, build
docs/index.html                          ← Generated hub page (never edit directly)
docs/[slug]/index.html                   ← Generated subject pages (never edit directly)
.github/workflows/deploy.yml             ← CI: runs on push to main
```

`build.js` exports: `parseContent()`, `renderSubjectPage()`, `renderHubPage()`, `buildSite()`.
All rendering is pure HTML + CSS — zero JavaScript on the output pages.

---

## Complementary Materials

Each subject has a dedicated folder at `complementary-study-docs/[slug]/` for teacher slides, PDFs, books, and any other supplementary files. Dump materials there as-is — no naming convention required.

**When adding a new subject**, always create the corresponding folder:
```bash
mkdir complementary-study-docs/[slug]
```

A future automated engine will process these files and enrich the subject pages. See [`docs/guides/complementary-materials-engine.md`](docs/guides/complementary-materials-engine.md) for the full roadmap. To trigger that work: start a session and say **"Let's build the complementary materials engine."**

---

## Detailed Guides

- [Adding a Subject (full guide)](docs/guides/adding-a-subject.md) — complete walkthrough with edge cases
- [Content Model Reference](docs/guides/content-model.md) — all frontmatter fields and valid values
- [Design System](docs/guides/design-system.md) — colors, fonts, CSS variables, breakpoints
- [Complementary Materials Engine](docs/guides/complementary-materials-engine.md) — planned pipeline for processing PDFs, slides, and books

---

## What NOT to Do

- Never edit `docs/*.html` directly — they are always regenerated by `build.js`
- Never commit with failing tests
- Never edit `build.js` templates unless the design needs to change globally
- Do not add JavaScript to the output pages — the design is intentionally JS-free
