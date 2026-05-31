# Adding a New Subject — Complete Guide

This is the step-by-step for adding a new FGV MBA subject to the platform. Follows the same process every time.

---

## Step 1: Find the Obsidian Note

```bash
ls "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/"
```

Read the relevant file:

```bash
cat "/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/[Subject Name].md"
```

Obsidian notes have no frontmatter — the content starts directly with Markdown.

---

## Step 2: Choose a Slug and Color

**Slug rules:**
- Lowercase, hyphens only, no accents or special characters
- Must be unique across all files in `content/`
- Will become the URL path: `https://acantidio.github.io/fgv-summary-platform/[slug]/`

Examples:
| Subject | Slug |
|---|---|
| Finanças Corporativas | `financas-corporativas` |
| Gestão de Projetos | `gestao-de-projetos` |
| Liderança e Comportamento Organizacional | `lideranca-e-comportamento` |

**Color selection:**
Check current usage:
```bash
grep "^color:" content/*.md
```

Pick the color used least often. Available: `purple`, `amber`, `teal`, `blue`, `rose`. With 20 subjects total, you'll cycle through colors multiple times — that's fine.

---

## Step 3: Create the Content File

Create `content/[slug].md`:

```markdown
---
title: Full Subject Name in Portuguese
slug: the-slug-you-chose
description: One concise sentence describing what this subject covers.
status: complete
color: rose
---

[paste Obsidian content here]
```

### Cleaning up Obsidian syntax

Before pasting, scan for these patterns:

| Obsidian syntax | Action |
|---|---|
| `[[Page Name]]` | Replace with `Page Name` (remove brackets) |
| `[[Page Name\|Display Text]]` | Replace with `Display Text` |
| `![[filename.png]]` | Remove entirely |
| `#tag` at start of line | Remove the `#` or remove the line |
| `%%comment%%` | Remove entirely |
| Tab-indented lists | Keep as-is — `marked` handles tabs fine |
| `**bold**`, `*italic*` | Keep as-is |
| `***triple***` | Renders as bold-italic — keep as-is |

### When notes are incomplete

If the class is still ongoing or notes are sparse, set `status: in-progress` and add a note at the bottom of the content:

```markdown
---

*(Conteúdo em andamento — notas sendo completadas)*
```

---

## Step 4: Validate and Build

```bash
npm test
```

Expected: all 5 tests pass. The first test (`content files exist and have valid frontmatter`) will catch any frontmatter errors immediately.

Common failures and fixes:

| Error | Fix |
|---|---|
| `missing frontmatter field "title"` | Add `title:` to frontmatter |
| `invalid status "done"` | Use `complete`, `in-progress`, or `pending` |
| `invalid color "green"` | Use `purple`, `amber`, `teal`, `blue`, or `rose` |
| `missing frontmatter field "slug"` | Add `slug:` field |

Once tests pass:

```bash
npm run build
```

Expected output: `✓ Built N subjects → docs/`

---

## Step 5: Visual Check

```bash
open docs/index.html
```

Checklist:
- [ ] New card appears on hub with correct title
- [ ] Badge shows correct status label in Portuguese (Concluído / Em andamento / Pendente)
- [ ] Color accent strip is correct
- [ ] Description text is readable
- [ ] Click through to subject page — back link works, content renders
- [ ] Nested lists render with proper indentation
- [ ] Bold/italic text is styled correctly

**Mobile check (browser DevTools):**
- Toggle device toolbar (iPhone 14 Pro: 393px)
- Hub: single column, no horizontal scroll
- Subject page: comfortable reading width, text not too small

---

## Step 6: Commit and Push

```bash
git add content/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions will run automatically:
1. Runs `npm test`
2. Runs `npm run build`
3. Commits updated `docs/` with `[skip ci]` tag
4. Site is live within ~2 minutes

Check the run:
```bash
gh run list --repo acantidio/fgv-summary-platform
```

---

## Step 7: Update Obsidian Index

Open `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Índice.md` and add the new subject to the list if it isn't there already.

---

## Updating Existing Content

When notes for an existing subject grow (e.g., after more classes), just:

1. Edit `content/[slug].md` — paste the updated Obsidian content, update `status` if needed
2. `npm test && npm run build`
3. `git add content/[slug].md docs/ && git commit -m "chore: update [Subject Name]" && git push`

The site rebuilds automatically.
