import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createStore } from '../server/store.js'

test('created documents persist and access follows sharing rules', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'draftly-'))
  const store = createStore(path.join(directory, 'db.json'))
  const document = await store.createDocument('user-puspo', { title: 'Product brief', content: '<p>Hello</p>' })
  assert.equal((await store.read()).documents[0].title, 'Product brief')
  assert.equal(store.canAccess(document, 'user-puspo'), true)
  assert.equal(store.canAccess(document, 'user-reviewer'), false)
  document.sharedWith.push('user-reviewer')
  assert.equal(store.canAccess(document, 'user-reviewer'), true)
  fs.rmSync(directory, { recursive: true, force: true })
})
