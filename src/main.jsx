import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const icons = {
  doc: '▤', plus: '+', upload: '↑', back: '←', share: '↗', check: '✓', users: '♢',
}

async function api(path, userId, options = {}) {
  const response = await fetch(`/api${path}`, { ...options, headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), 'x-user-id': userId, ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}

function App() {
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState(localStorage.getItem('draftly-user') || 'user-puspo')
  const [documents, setDocuments] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fileRef = useRef()

  useEffect(() => { api('/users', userId).then(setUsers).catch(showError) }, [])
  useEffect(() => { localStorage.setItem('draftly-user', userId); setActive(null); loadDocuments() }, [userId])
  const showError = (err) => { setError(err.message); setTimeout(() => setError(''), 4000) }
  async function loadDocuments() {
    setLoading(true)
    try { setDocuments(await api('/documents', userId)) } catch (err) { showError(err) } finally { setLoading(false) }
  }
  async function createDocument() {
    try { setActive(await api('/documents', userId, { method: 'POST', body: JSON.stringify({}) })) } catch (err) { showError(err) }
  }
  async function importFile(event) {
    const file = event.target.files[0]
    if (!file) return
    const body = new FormData(); body.append('file', file)
    try { setActive(await api('/documents/import', userId, { method: 'POST', body })); await loadDocuments() } catch (err) { showError(err) }
    event.target.value = ''
  }
  const currentUser = users.find((user) => user.id === userId)

  if (active) return <Editor document={active} userId={userId} users={users} onBack={() => { setActive(null); loadDocuments() }} showError={showError} error={error} />
  const owned = documents.filter((document) => document.access === 'owned')
  const shared = documents.filter((document) => document.access === 'shared')
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">D</span><span>Draftly</span></div>
      <div className="user-switcher"><span className="avatar" style={{ background: currentUser?.color }}>{currentUser?.name?.[0]}</span><label><small>Viewing as</small><select value={userId} onChange={(event) => setUserId(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label></div>
    </header>
    <main className="dashboard">
      <section className="hero"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {currentUser?.name?.split(' ')[0]}.</h1><p>Create something worth sharing.</p></div><div className="hero-actions"><button className="button primary" onClick={createDocument}><b>{icons.plus}</b> New document</button><button className="button secondary" onClick={() => fileRef.current.click()}>{icons.upload} Import file</button><input ref={fileRef} hidden type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importFile}/></div></section>
      {loading ? <div className="empty">Loading your workspace…</div> : <>
        <DocumentSection title="Owned by me" subtitle={`${owned.length} document${owned.length === 1 ? '' : 's'}`} docs={owned} onOpen={setActive}/>
        <DocumentSection title="Shared with me" subtitle={`${shared.length} document${shared.length === 1 ? '' : 's'}`} docs={shared} onOpen={setActive} shared/>
      </>}
      <p className="import-note">Import supports .txt and .md files up to 1 MB.</p>
    </main>
    {error && <div className="toast error">{error}</div>}
  </div>
}

function DocumentSection({ title, subtitle, docs, onOpen, shared }) {
  return <section className="doc-section"><div className="section-heading"><h2>{title}</h2><span>{subtitle}</span></div>
    {docs.length ? <div className="doc-grid">{docs.map((doc) => <button className="doc-card" key={doc.id} onClick={() => onOpen(doc)}><div className="paper-preview"><span>{icons.doc}</span><div dangerouslySetInnerHTML={{ __html: doc.content }} /></div><div className="doc-meta"><strong>{doc.title}</strong><span>{shared ? `Shared by ${doc.owner?.name}` : `Edited ${relativeTime(doc.updatedAt)}`}</span></div></button>)}</div> : <div className="empty compact"><span>{shared ? icons.users : icons.doc}</span><div><strong>{shared ? 'Nothing shared yet' : 'Your ideas start here'}</strong><p>{shared ? 'Documents shared with this account appear here.' : 'Create a document or import a text file.'}</p></div></div>}
  </section>
}

function relativeTime(date) {
  const mins = Math.round((Date.now() - new Date(date)) / 60000)
  if (mins < 1) return 'just now'; if (mins < 60) return `${mins}m ago`; if (mins < 1440) return `${Math.floor(mins / 60)}h ago`; return new Date(date).toLocaleDateString()
}

function Editor({ document: doc, userId, users, onBack, showError, error }) {
  const [title, setTitle] = useState(doc.title)
  const [content, setContent] = useState(doc.content)
  const [status, setStatus] = useState('Saved')
  const [shareOpen, setShareOpen] = useState(false)
  const editorRef = useRef()
  const timer = useRef()
  const isOwner = doc.ownerId === userId

  async function save(nextTitle = title, nextContent = content) {
    setStatus('Saving…')
    try { await api(`/documents/${doc.id}`, userId, { method: 'PATCH', body: JSON.stringify({ title: nextTitle, content: nextContent }) }); setStatus('Saved') } catch (err) { setStatus('Save failed'); showError(err) }
  }
  function queueSave(nextTitle, nextContent) { setStatus('Unsaved'); clearTimeout(timer.current); timer.current = setTimeout(() => save(nextTitle, nextContent), 700) }
  function editContent() { const next = editorRef.current.innerHTML; setContent(next); queueSave(title, next) }
  function editTitle(event) { const next = event.target.value; setTitle(next); queueSave(next, content) }
  function format(command, value) { editorRef.current.focus(); document.execCommand(command, false, value); editContent() }
  useEffect(() => () => clearTimeout(timer.current), [])

  return <div className="editor-shell">
    <header className="editor-header"><button className="icon-button" onClick={onBack} aria-label="Back">{icons.back}</button><span className="mini-logo">D</span><div className="title-stack"><input value={title} onChange={editTitle} onBlur={() => save(title, content)} aria-label="Document title"/><span className={`save-state ${status === 'Save failed' ? 'bad' : ''}`}>{status === 'Saved' && icons.check} {status}</span></div><div className="editor-actions"><span className="owner-note">{isOwner ? 'You own this' : `Shared by ${doc.owner?.name || 'owner'}`}</span>{isOwner && <button className="button primary small" onClick={() => setShareOpen(true)}>{icons.share} Share</button>}</div></header>
    <div className="toolbar" role="toolbar"><button onClick={() => format('bold')}><b>B</b></button><button onClick={() => format('italic')}><i>I</i></button><button onClick={() => format('underline')}><u>U</u></button><span></span><select aria-label="Text style" onChange={(e) => format('formatBlock', e.target.value)} defaultValue="p"><option value="p">Normal text</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select><span></span><button onClick={() => format('insertUnorderedList')} aria-label="Bulleted list">• List</button><button onClick={() => format('insertOrderedList')} aria-label="Numbered list">1. List</button></div>
    <main className="canvas"><article ref={editorRef} className="page" contentEditable suppressContentEditableWarning onInput={editContent} dangerouslySetInnerHTML={{ __html: content }} /></main>
    {shareOpen && <ShareModal document={doc} userId={userId} users={users} close={() => setShareOpen(false)} showError={showError}/>} {error && <div className="toast error">{error}</div>}
  </div>
}

function ShareModal({ document, userId, users, close, showError }) {
  const [email, setEmail] = useState('reviewer@ajaia.com')
  const [done, setDone] = useState(false)
  async function share(event) { event.preventDefault(); try { await api(`/documents/${document.id}/share`, userId, { method: 'POST', body: JSON.stringify({ email }) }); setDone(true) } catch (err) { showError(err) } }
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><button className="modal-x" onClick={close}>×</button><p className="eyebrow">SHARING</p><h2>Share “{document.title}”</h2>{done ? <div className="success-panel"><span>{icons.check}</span><strong>Access granted</strong><p>{email} can now open and edit this document.</p><button className="button primary" onClick={close}>Done</button></div> : <form onSubmit={share}><label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><p className="helper">Demo users: {users.filter((u) => u.id !== userId).map((u) => u.email).join(', ')}</p><div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button primary">Grant edit access</button></div></form>}</div></div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
