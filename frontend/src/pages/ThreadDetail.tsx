import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface Reply {
  id: number
  username: string
  content_sanitized: string
  created_at: string
}

interface Thread {
  id: number
  title: string
  username: string
  content_sanitized: string
  is_locked: boolean
  created_at: string
  replies: Reply[]
}

export default function ThreadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [thread, setThread] = useState<Thread | null>(null)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getThread(Number(id))
      .then(setThread)
      .catch(() => {
        setError('Thread not found')
        navigate('/forum')
      })
      .finally(() => setLoading(false))
  }, [id])

  const submitReply = async () => {
    if (!reply.trim() || !id || submitting) return
    setSubmitting(true)
    try {
      const r = await api.replyToThread(Number(id), reply)
      setReply('')
      setThread((prev) => prev ? { ...prev, replies: [...(prev.replies || []), r] } : prev)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="empty-state"><div className="spinner" /></div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="page-content">
        <div className="empty-state"><div className="text-muted">Thread not found.</div></div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div style={{ marginBottom: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/forum')}>← Back</button>
        </div>
        <h1>{thread.title || ''}</h1>
        <p className="subtitle font-mono" style={{ fontSize: 11 }}>
          {thread.username || ''} · {thread.created_at ? new Date(thread.created_at).toLocaleDateString() : ''}
          {thread.is_locked && <span style={{ color: 'var(--warning)', marginLeft: 8 }}>🔒 Locked</span>}
        </p>
      </div>
      <div className="page-content fade-in">
        {error && <div className="error-banner mb-4">{error}</div>}

        <div className="card mb-4 thread-content" style={{ borderLeft: '2px solid var(--accent)' }}>
          <p style={{ lineHeight: 1.7, fontSize: 14 }}>{thread.content_sanitized || ''}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="card-title mb-4">Replies ({(thread.replies || []).length})</div>
          {(thread.replies || []).length === 0 ? (
            <div className="text-muted text-sm">No replies yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {thread.replies.map((r) => (
                <div key={r.id} className="card reply-card" style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{r.content_sanitized || ''}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono" style={{ color: 'var(--cyan)', fontSize: 11 }}>{r.username || ''}</span>
                    <span className="text-muted" style={{ fontSize: 11 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!thread.is_locked && (
          <div className="slide-up">
            <textarea className="input textarea" placeholder="Write a reply..." value={reply}
              onChange={(e) => setReply(e.target.value)} disabled={submitting} style={{ marginBottom: 8 }} />
            <button className="btn btn-primary" onClick={submitReply} disabled={submitting || !reply.trim()}>
              {submitting ? 'Posting...' : 'Reply'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
