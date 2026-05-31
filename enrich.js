import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, 'content')
const ENRICHED_DIR = join(__dirname, 'content', 'enriched')

const SYSTEM_PROMPT = `Você é um designer instrucional especializado em conteúdo de MBA brasileiro. Sua tarefa é transformar anotações brutas de aula em um documento de aprendizagem de alta qualidade.

Você receberá anotações brutas de estudo. Transforme-as em um documento estruturado seguindo estas regras:

1. RESUMO: Adicione um callout \`> [!SUMMARY]\` no início do corpo (antes de qualquer heading). Escreva 2-3 frases em português capturando o essencial da disciplina — o que o aluno precisa dominar.

2. REESTRUTURE: Organize o conteúdo em seções claras com headings H2/H3 descritivos. Melhore o fluxo e a clareza sem perder nenhuma informação.

3. ALERTAS DE PROVA: Identifique qualquer conteúdo que o aluno marcou como importante para provas (frases como "cai em todas", "sempre cai", "destaque", palavras em MAIÚSCULAS de ênfase). Envolva esse conteúdo em callouts \`> [!EXAM]\` próximos a onde aparece no texto.

4. CONCEITOS-CHAVE: Para cada framework, modelo ou conceito importante (ex: SWOT, BSC, Forças de Porter, OKR), crie um callout \`> [!KEY]\` com uma definição limpa de 1 parágrafo em português. Coloque-o onde o conceito aparece pela primeira vez.

5. PERGUNTAS DE RECALL: Ao final do documento, adicione uma seção \`## Perguntas de Recall\` com 4 a 6 callouts \`> [!RECALL]\`. Cada um deve ser uma pergunta que testa a compreensão de um conceito-chave das notas. Escreva as perguntas em português.

6. PRESERVE: Não invente informações. Não descarte informações. Todo fato das notas brutas deve aparecer no output.

7. IDIOMA: Escreva inteiramente em português. Mesmo registro das notas originais.

8. OUTPUT: Retorne apenas o corpo do markdown enriquecido — sem frontmatter, sem cercas de código, sem preâmbulo ou explicação. Apenas o conteúdo.

Sintaxe dos callouts (exatamente assim):
> [!SUMMARY]
> texto aqui

> [!EXAM]
> texto aqui

> [!KEY]
> texto aqui

> [!RECALL]
> texto aqui`

export async function enrichSubject(slug) {
  const rawPath = join(CONTENT_DIR, `${slug}.md`)
  if (!existsSync(rawPath)) {
    throw new Error(`Content file not found: ${rawPath}`)
  }

  const raw = readFileSync(rawPath, 'utf-8')
  const { data, content } = matter(raw)

  const client = new Anthropic()
  console.log(`Enriching "${slug}" with Claude Opus 4.7...`)

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: content.trim() }],
  })

  const enrichedBody = response.content[0].text
  const enrichedFile = matter.stringify(enrichedBody, data)

  mkdirSync(ENRICHED_DIR, { recursive: true })
  writeFileSync(join(ENRICHED_DIR, `${slug}.md`), enrichedFile, 'utf-8')

  console.log(`✓ Enriched ${slug} (${response.usage.input_tokens} in / ${response.usage.output_tokens} out)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)

  if (!args[0]) {
    console.error('Usage: npm run enrich -- <slug>')
    console.error('       npm run enrich -- --all')
    process.exit(1)
  }

  if (args[0] === '--all') {
    const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const slug = file.replace('.md', '')
      const enrichedPath = join(ENRICHED_DIR, file)
      if (!existsSync(enrichedPath)) {
        await enrichSubject(slug)
      } else {
        console.log(`↩ Skipping ${slug} (enriched file already exists)`)
      }
    }
  } else {
    await enrichSubject(args[0])
  }
}
