import express from 'express'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createConfiguredStore } from './store.js'

export function createApp(store = createConfiguredStore()) {
  const app = express()
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } })
  app.use(express.json({ limit: '2mb' }))

  const fail = (res, status, error) => res.status(status).json({ error })
  const userFrom = (req, db) => db.users.find((user) => user.id === req.header('x-user-id'))

  app.get('/api/users', (_req, res) => res.json([{ id: 'user-puspo', name: 'Puspo Dwi Aditya', email: 'puspo@demo.com', color: '#6750a4' }, { id: 'user-reviewer', name: 'Ajaia Reviewer', email: 'reviewer@ajaia.com', color: '#00796b' }]))
  app.get('/api/documents', async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    const documents = db.documents.filter((doc) => store.canAccess(doc, user.id)).map((doc) => ({ ...doc, owner: db.users.find((item) => item.id === doc.ownerId), access: doc.ownerId === user.id ? 'owned' : 'shared' }))
    res.json(documents)
  } catch (error) { next(error) } })
  app.post('/api/documents', async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    res.status(201).json(await store.createDocument(user.id, req.body))
  } catch (error) { next(error) } })
  app.post('/api/documents/import', upload.single('file'), async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    if (!req.file) return fail(res, 400, 'Select a file to import.')
    const extension = path.extname(req.file.originalname).toLowerCase()
    if (!['.txt', '.md'].includes(extension)) return fail(res, 400, 'Only .txt and .md files are supported.')
    const escape = (value) => value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
    const paragraphs = escape(req.file.buffer.toString('utf8')).split(/\r?\n/).map((line) => `<p>${line || '<br>'}</p>`).join('')
    res.status(201).json(await store.createDocument(user.id, { title: path.basename(req.file.originalname, extension), content: paragraphs }))
  } catch (error) { next(error) } })
  app.get('/api/documents/:id', async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    const document = db.documents.find((doc) => doc.id === req.params.id)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    if (!document || !store.canAccess(document, user.id)) return fail(res, 404, 'Document not found or not shared with you.')
    res.json({ ...document, owner: db.users.find((item) => item.id === document.ownerId), access: document.ownerId === user.id ? 'owned' : 'shared' })
  } catch (error) { next(error) } })
  app.patch('/api/documents/:id', async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    const document = db.documents.find((doc) => doc.id === req.params.id)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    if (!document || !store.canAccess(document, user.id)) return fail(res, 404, 'Document not found or not shared with you.')
    if (typeof req.body.title === 'string') document.title = req.body.title.trim() || 'Untitled document'
    if (typeof req.body.content === 'string') document.content = req.body.content
    document.updatedAt = new Date().toISOString()
    await store.write(db)
    res.json(document)
  } catch (error) { next(error) } })
  app.post('/api/documents/:id/share', async (req, res, next) => { try {
    const db = await store.read()
    const user = userFrom(req, db)
    const document = db.documents.find((doc) => doc.id === req.params.id)
    if (!user) return fail(res, 401, 'Choose a valid demo user.')
    if (!document || document.ownerId !== user.id) return fail(res, 403, 'Only the owner can manage sharing.')
    const recipient = db.users.find((item) => item.email.toLowerCase() === String(req.body.email || '').toLowerCase())
    if (!recipient) return fail(res, 400, 'No demo user found with that email.')
    if (recipient.id === user.id) return fail(res, 400, 'You already own this document.')
    if (!document.sharedWith.includes(recipient.id)) document.sharedWith.push(recipient.id)
    document.updatedAt = new Date().toISOString()
    await store.write(db)
    res.json(document)
  } catch (error) { next(error) } })

  app.use('/api', (error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'The server could not complete this request.' }) })

  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
  app.use(express.static(root))
  app.use((_req, res) => res.sendFile(path.join(root, 'index.html')))
  return app
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001
  createApp().listen(port, () => console.log(`Draftly running on http://localhost:${port}`))
}
