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
```bash
grep "^color:" content/*.md
```

Pick the color used least often. Available: `purple`, `amber`, `teal`, `blue`, `rose`.

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

### When notes are incomplete

If the class is still ongoing or notes are sparse, set `status: in-progress` and add a note at the bottom of the content:

```markdown
---

*(Conteúdo em andamento — notas sendo completadas)*
```

---

## Step 4: Enrich with AI

Transform the raw notes into a structured learning document using Claude Opus 4.7:

```bash
npm run enrich -- [slug]
```

This reads `content/[slug].md`, calls Claude Opus 4.7, and writes `content/enriched/[slug].md`.

**First-time setup** — make sure `.env` exists in the project root with your API key:
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

The `.env` file is gitignored and never committed.

Expected output:
```
Enriching "[slug]" with Claude Opus 4.7...
✓ Enriched [slug] (NNN in / NNN out)
```

**The enriched file is what gets built and displayed.** If you significantly update the raw notes later, delete the enriched file and re-run:
```bash
rm content/enriched/[slug].md && npm run enrich -- [slug]
```

---

## Step 5: Validate and Build

```bash
npm test
```

Expected: all tests pass. Common failures and fixes:

| Error | Fix |
|---|---|
| `missing frontmatter field "title"` | Add `title:` to frontmatter |
| `invalid status "done"` | Use `complete`, `in-progress`, or `pending` |
| `invalid color "green"` | Use `purple`, `amber`, `teal`, `blue`, or `rose` |

Once tests pass:

```bash
npm run build
```

Expected output: `✓ Built N subjects → docs/`

---

## Step 6: Visual Check

```bash
open docs/index.html
```

Checklist:
- [ ] New card appears on hub with correct title, color, and description
- [ ] Click through to subject page — back link works
- [ ] Summary callout (◎ Resumo) appears at the top
- [ ] At least one Exam alert (⚠ Cai na Prova) is visible
- [ ] At least one Key concept (◆ Conceito-Chave) card is present
- [ ] Recall questions (? Recall Ativo) section appears at the bottom
- [ ] All content from original notes is present

**Mobile check (browser DevTools, 390px):**
- Single column layout, no horizontal scroll
- Callout cards readable and not clipped

---

## Step 7: Commit and Push

```bash
git add content/[slug].md content/enriched/[slug].md docs/
git commit -m "feat: add [Subject Name]"
git push
```

GitHub Actions runs `npm test` + `npm run build` automatically. Site is live within ~2 minutes.

Check the run:
```bash
gh run list --repo acantidio/fgv-summary-platform
```

---

## Step 8: Create the Complementary Materials Folder

```bash
mkdir complementary-study-docs/[slug]
```

Drop any teacher slides, PDFs, or books there whenever you have them.

---

## Step 9: Update Obsidian Index

Open `/Users/andrecantidio/Documents/Obsidian/main/MBA GE80/Índice.md` and add the new subject to the list if it isn't there already.

---

## Updating Existing Content

When notes for an existing subject grow (e.g., after more classes):

1. Edit `content/[slug].md` — paste the updated Obsidian content, update `status` if needed
2. Re-enrich: `rm content/enriched/[slug].md && npm run enrich -- [slug]`
3. `npm test && npm run build`
4. `git add content/[slug].md content/enriched/[slug].md docs/ && git commit -m "chore: update [Subject Name]" && git push`
