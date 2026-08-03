import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Announcement {
  id: number
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  author: string
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <h1>The Signal</h1>
        <p className="subtitle">Official announcements from leadership.</p>
      </div>
      <div className="page-content">
        {error && <div className="error-banner mb-4">{error}</div>}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map((i) => (
              <div key={i} className="card"><div className="skeleton" style={{ height: 120 }} /></div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="icon">◎</div>
            <div>No announcements yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-in">
            {announcements.map((a, i) => (
              <div key={a.id} className="card announcement-card" style={{
                borderLeft: a.is_pinned ? '2px solid var(--warning)' : '1px solid var(--border)',
                animationDelay: `${i * 0.05}s`,
              }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  {a.is_pinned && <span style={{ color: 'var(--warning)', fontSize: 14 }}>📌</span>}
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{a.title || ''}</span>
                </div>
                <div style={{ lineHeight: 1.7, fontSize: 14, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{a.content || ''}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{a.author || ''}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''} · {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
