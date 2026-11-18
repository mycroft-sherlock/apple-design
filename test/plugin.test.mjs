import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { apply, inject } from '../lib/index.js'

const SKILL = process.env.APPLE_DESIGN_SKILL_DIR || path.join(process.env.USERPROFILE || process.env.HOME || '', '.dsh', 'skills', 'apple-design')

function mount() {
  const tools = new Map()
  const skills = []
  const ctx = {
    get(name) {
      return name === 'skills' ? { list: () => [], register: (def) => { skills.push(def); return () => {} } } : undefined
    },
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
        return () => tools.delete(definition.name)
      },
    },
    effect(factory) {
      factory()
      return () => {}
    },
  }
  apply(ctx)
  return { tools, skills }
}

test('declares tools service and registers three read-only tools', () => {
  assert.deepEqual(inject, ['tools'])
  const { tools } = mount()
  assert.deepEqual([...tools.keys()].sort(), ['apple_design_hig', 'apple_design_index', 'apple_design_pages'])
})

test('registers the apple-design skill when not already present', () => {
  const { skills } = mount()
  assert.equal(skills.length, 1)
  assert.equal(skills[0].name, 'apple-design')
  assert.match(skills[0].content, /Apple Design Skill/)
})

test('pages lists installed HIG references', { skip: !fs.existsSync(path.join(SKILL, 'references', 'hig')) }, async () => {
  const { tools } = mount()
  const payload = JSON.parse(await tools.get('apple_design_pages').execute({}))
  assert.ok(payload.count > 100)
  assert.ok(payload.pages.includes('buttons.md'))
})

test('hig reads one page and rejects traversal', { skip: !fs.existsSync(path.join(SKILL, 'references', 'hig')) }, async () => {
  const { tools } = mount()
  await assert.rejects(() => tools.get('apple_design_hig').execute({ page: '../SKILL.md' }))
  const payload = JSON.parse(await tools.get('apple_design_hig').execute({ page: 'buttons.md' }))
  assert.equal(payload.page, 'buttons.md')
  assert.match(payload.content, /Button|button/)
})
