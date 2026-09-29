import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const here = path.dirname(fileURLToPath(import.meta.url))
const defaultFile = path.join(here, '..', 'data', 'db.json')

export const seed = {
  users: [
    { id: 'user-puspo', name: 'Puspo Dwi Aditya', email: 'puspo@demo.com', color: '#6750a4' },
    { id: 'user-reviewer', name: 'Ajaia Reviewer', email: 'reviewer@ajaia.com', color: '#00796b' },
  ],
  documents: [],
}

export function createStore(file = process.env.DATA_FILE || defaultFile) {
  function ensure() {
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(seed, null, 2))
  }
  function read() {
    ensure()
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  }
  function write(data) {
    ensure()
    const temp = `${file}.tmp`
    fs.writeFileSync(temp, JSON.stringify(data, null, 2))
    fs.renameSync(temp, file)
    return data
  }
  function createDocument(ownerId, { title = 'Untitled document', content = '<p></p>' } = {}) {
    const db = read()
    if (!db.users.some((user) => user.id === ownerId)) throw new Error('USER_NOT_FOUND')
    const now = new Date().toISOString()
    const document = { id: crypto.randomUUID(), title: title.trim() || 'Untitled document', content, ownerId, sharedWith: [], createdAt: now, updatedAt: now }
    db.documents.unshift(document)
    write(db)
    return document
  }
  function canAccess(document, userId) {
    return document.ownerId === userId || document.sharedWith.includes(userId)
  }
  return { file, read: async () => read(), write: async (data) => write(data), createDocument: async (ownerId, input) => createDocument(ownerId, input), canAccess }
}

export function createSupabaseStore(url, serviceKey) {
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
  async function request(route, options = {}) {
    const response = await fetch(`${url}/rest/v1/${route}`, { ...options, headers: { ...headers, Prefer: 'return=representation', ...options.headers } })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.message || body?.hint || `Supabase request failed (${response.status})`)
    return body
  }
  const fromRow = (row) => ({ id: row.id, title: row.title, content: row.content, ownerId: row.owner_id, sharedWith: row.shared_with || [], createdAt: row.created_at, updatedAt: row.updated_at })
  const toRow = (doc) => ({ id: doc.id, title: doc.title, content: doc.content, owner_id: doc.ownerId, shared_with: doc.sharedWith, created_at: doc.createdAt, updated_at: doc.updatedAt })
  async function read() {
    const rows = await request('documents?select=*&order=updated_at.desc')
    return { users: seed.users, documents: rows.map(fromRow) }
  }
  async function write(data) {
    for (const doc of data.documents) await request(`documents?id=eq.${encodeURIComponent(doc.id)}`, { method: 'PATCH', body: JSON.stringify(toRow(doc)) })
    return data
  }
  async function createDocument(ownerId, { title = 'Untitled document', content = '<p></p>' } = {}) {
    if (!seed.users.some((user) => user.id === ownerId)) throw new Error('USER_NOT_FOUND')
    const now = new Date().toISOString()
    const doc = { id: crypto.randomUUID(), title: title.trim() || 'Untitled document', content, ownerId, sharedWith: [], createdAt: now, updatedAt: now }
    const rows = await request('documents', { method: 'POST', body: JSON.stringify(toRow(doc)) })
    return fromRow(rows[0])
  }
  function canAccess(document, userId) { return document.ownerId === userId || document.sharedWith.includes(userId) }
  return { read, write, createDocument, canAccess }
}

export function createConfiguredStore() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return createSupabaseStore(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  return createStore()
}
