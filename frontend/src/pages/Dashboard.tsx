import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../store/auth'

interface DashboardData {
  member_count: number
  announcement_count: number
  plan_count: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.getDashboard().catch(() => null),
      api.getAnnouncements().catch(() => [] as any[]),
      api.getPlans().catch(() => [] as any[]),
    ]).then(([d, a, p]) => {
      if (!d) { setError('Failed to load stats'); setLoading(false); return }
      setData(d)
      setAnnouncements(a)
      setPlans(p)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <>
        <div className="page-header"><h1>The Observatory</h1></div>
        <div className="page-content">
          <div className="grid-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card"><div className="skeleton" style={{ height: 60 }} /></div>
            ))}
          </div>
          <div className="grid-2">
            <div className="card"><div className="skeleton" style={{ height: 200 }} /></div>
            <div className="card"><div className="skeleton" style={{ height: 200 }} /></div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="page-header"><h1>The Observatory</h1></div>
        <div className="page-content">
          <div className="empty-state">
            <div className="icon" style={{ color: 'var(--danger)' }}>⚠</div>
            <div style={{ color: 'var(--danger)' }}>{error}</div>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1>The Observatory</h1>
        <p className="subtitle">Welcome back, {user?.username}.</p>
      </div>
      <div className="page-content fade-in">
        <div className="grid-3 mb-4">
          <div className="card stat-card">
            <div className="card-title">Members</div>
            <div className="card-value">{data?.member_count ?? '—'}</div>
          </div>
          <div className="card stat-card">
            <div className="card-title">Announcements</div>
            <div className="card-value">{data?.announcement_count ?? '—'}</div>
          </div>
          <div className="card stat-card">
            <div className="card-title">Plans Active</div>
            <div className="card-value">{data?.plan_count ?? '—'}</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="card-title" style={{ margin: 0 }}>Latest Signal</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/announcements')}>View all</button>
            </div>
            {announcements.length === 0 ? (
              <div className="text-muted text-sm">No announcements yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.slice(0, 3).map((a: any, i: number) => (
                  <div key={a.id} className="feed-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      {a.is_pinned && <span style={{ color: '#ffaa33', fontSize: 12 }}>📌</span>}
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</span>
                    </div>
                    <div className="text-muted text-sm">{a.content?.slice(0, 120)}{a.content?.length > 120 ? '...' : ''}</div>
                    <div className="text-muted text-sm" style={{ fontSize: 11, marginTop: 4 }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="card-title" style={{ margin: 0 }}>Latest Blueprints</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plans')}>View all</button>
            </div>
            {plans.length === 0 ? (
              <div className="text-muted text-sm">No plans yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plans.slice(0, 3).map((p: any, i: number) => (
                  <div key={p.id} className="feed-item" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                    <div className="text-muted text-sm">{p.content?.slice(0, 120)}{p.content?.length > 120 ? '...' : ''}</div>
                    <div className="text-muted text-sm" style={{ fontSize: 11, marginTop: 4 }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
