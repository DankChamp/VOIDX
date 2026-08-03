import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface Thread {
  id: number
  title: string
  username: string
  content_sanitized: string
  is_locked: boolean
  created_at: string
  reply_count: number
}

export default function Forum() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [showNew, setShowNew] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    setError('')
    api.getThreads()
      .then(setThreads)
      .catch(() => setError('Failed to load threads'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!title.trim() || !content.trim() || submitting) return
    setSubmitting(true)
    try {
      await api.createThread(title, content)
      setTitle('')
      setContent('')
      setShowNew(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>The Echo</h1>
            <p className="subtitle">Forum discussions — all content AI-sanitized.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(!showNew)}>
            {showNew ? 'Cancel' : 'New Thread'}
          </button>
        </div>
      </div>
      <div className="page-content">
        {error && (
          <div className="error-banner mb-4">{error}</div>
        )}

        {showNew && (
          <div className="card mb-4 slide-up">
            <div className="card-title mb-4">New Thread</div>
            <input className="input" placeholder="Title" value={title}
              onChange={(e) => setTitle(e.target.value)} disabled={submitting} style={{ marginBottom: 8 }} />
            <textarea className="input textarea" placeholder="What's on your mind?" value={content}
              onChange={(e) => setContent(e.target.value)} disabled={submitting} style={{ marginBottom: 8 }} />
            <button className="btn btn-primary" onClick={create} disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="card"><div className="skeleton" style={{ height: 80 }} /></div>
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="icon">○</div>
            <div>No threads yet. Start a conversation.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="fade-in">
            {threads.map((t, i) => (
              <div key={t.id} className="card thread-card" style={{ cursor: 'pointer', animationDelay: `${i * 0.03}s` }}
                onClick={() => navigate(`/forum/${t.id}`)}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <div className="flex items-center gap-2">
                    {t.is_locked && <span style={{ color: 'var(--warning)', fontSize: 12 }}>🔒</span>}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{t.title || ''}</span>
                  </div>
                  <span className="text-muted text-sm">{t.reply_count ?? 0} replies</span>
                </div>
                <div className="text-muted text-sm" style={{ marginBottom: 6 }}>
                  {t.content_sanitized?.slice(0, 200)}{t.content_sanitized?.length > 200 ? '...' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono" style={{ color: 'var(--cyan)', fontSize: 11 }}>{t.username || ''}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
