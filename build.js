import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { marked } from 'marked'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const CONTENT_DIR = join(__dirname, 'content')
export const DOCS_DIR = join(__dirname, 'docs')

export function parseContent(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    title: data.title,
    slug: data.slug,
    description: data.description,
    status: data.status,
    color: data.color,
    html: marked(content),
  }
}
