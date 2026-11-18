/**
 * Host half of dsh-apple-design.
 *
 * Reads the user-installed upstream apple-design skill, registers it if absent,
 * and exposes read-only tools over its HIG references. It does not bundle the
 * upstream skill or Apple's HIG text.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const name = 'dsh-apple-design'
export const inject = ['tools']

const MAX_REFERENCE_BYTES = 200 * 1024
const PAGE_RE = /^[a-z0-9][a-z0-9-]*\.md$/
const stringOutput = {
  schema: { type: 'string' },
  render: (_args, value) => [{ type: 'text', text: String(value) }],
}

function skillRoot() {
  return process.env.APPLE_DESIGN_SKILL_DIR
    ? path.resolve(process.env.APPLE_DESIGN_SKILL_DIR)
    : path.join(os.homedir(), '.dsh', 'skills', 'apple-design')
}

function readText(file) {
  const stat = fs.statSync(file)
  if (!stat.isFile()) throw new Error(`${file} is not a file`)
  if (stat.size > MAX_REFERENCE_BYTES) throw new Error(`File is larger than ${MAX_REFERENCE_BYTES} bytes`)
  return fs.readFileSync(file, 'utf8')
}

const BOOTSTRAP = `# Apple Design

The apple-design skill is not installed yet.

Install it from the upstream repository:

\`\`\`bash
npx skills add dickwu/apple-design-skill
\`\`\`

Or set APPLE_DESIGN_SKILL_DIR to an existing checkout. This plugin does not
redistribute the upstream skill or Apple's HIG text.
`

function registerSkill(ctx) {
  const root = skillRoot()
  const skillFile = path.join(root, 'SKILL.md')
  const content = fs.existsSync(skillFile) ? readText(skillFile) : BOOTSTRAP
  const skills = ctx.get('skills')
  if (!skills || typeof skills.register !== 'function') return
  const existing = typeof skills.list === 'function' ? skills.list() : []
  if (Array.isArray(existing) && existing.some((s) => s?.name === 'apple-design')) return
  ctx.effect(
    () => skills.register({
      name: 'apple-design',
      title: 'Apple Design · HIG 设计审查',
      description: 'Cross-platform UI/UX design review grounded in Apple Human Interface Guidelines, with HIG page routing and a design-craft lens.',
      whenToUse: 'Use for iOS/macOS/Flutter/React Native/Tauri/Electron UI review, HIG compliance, accessibility, dark mode, Liquid Glass, navigation, forms, Apple Pay, widgets, onboarding, or "make this less generic" requests.',
      source: 'apple-design',
      content,
    }),
    'dsh-apple-design: register skill',
  )
}

export function apply(ctx) {
  const root = skillRoot()
  const refs = path.join(root, 'references', 'hig')
  const lookup = path.join(root, 'references', 'hig-lookup.md')
  registerSkill(ctx)

  const registrations = [
    {
      name: 'apple_design_pages',
      description: 'List the installed apple-design HIG reference pages. Read-only. Use apple_design_hig to open one.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
      output: stringOutput,
      async execute() {
        if (!fs.existsSync(refs)) throw new Error(`apple-design references not found at ${refs}. Install with: npx skills add dickwu/apple-design-skill`)
        const pages = fs.readdirSync(refs).filter((f) => PAGE_RE.test(f)).sort()
        return JSON.stringify({ root, count: pages.length, pages }, null, 2)
      },
    },
    {
      name: 'apple_design_hig',
      description: 'Read one installed Apple HIG reference page by filename (for example buttons.md). Read-only and path-safe.',
      parameters: {
        type: 'object',
        properties: { page: { type: 'string', description: 'HIG page filename ending in .md' } },
        required: ['page'],
        additionalProperties: false,
      },
      output: stringOutput,
      async execute(args) {
        const page = String(args?.page ?? '')
        if (!PAGE_RE.test(page)) throw new Error('page must be a HIG filename such as buttons.md')
        if (!fs.existsSync(refs)) throw new Error(`apple-design references not found at ${refs}. Install with: npx skills add dickwu/apple-design-skill`)
        return JSON.stringify({ page, source: path.join(refs, page), content: readText(path.join(refs, page)) }, null, 2)
      },
    },
    {
      name: 'apple_design_index',
      description: 'Read the generated HIG routing index (hig-lookup.md). Read-only.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
      output: stringOutput,
      async execute() {
        if (!fs.existsSync(lookup)) throw new Error(`apple-design index not found at ${lookup}. Install with: npx skills add dickwu/apple-design-skill`)
        return JSON.stringify({ source: lookup, content: readText(lookup) }, null, 2)
      },
    },
  ]

  for (const definition of registrations) {
    ctx.effect(() => ctx.tools.register(definition), `dsh-apple-design: ${definition.name}`)
  }
}
