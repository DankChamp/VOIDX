import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../store/auth'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.getDashboard().catch(() => null),
      api.getUsers().catch(() => []),
      api.getPlans().catch(() => []),
      api.getAnnouncements().catch(() => []),
    ]).then(([s, u, p, a]) => {
      setStats(s)
      setUsers(u)
      setPlans(p)
      setAnnouncements(a)
      setLoading(false)
    }).catch(() => {
      setError('Failed to load admin data')
      setLoading(false)
    })
  }, [])

  if (user?.role !== 'leader') return <Navigate to="/" replace />

  if (loading) {
    return (
      <>
        <div className="page-header"><h1>The Throne</h1></div>
        <div className="page-content">
          <div className="grid-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card"><div className="skeleton" style={{ height: 60 }} /></div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <h1>The Throne</h1>
        <p className="subtitle">Command center — manage your team.</p>
      </div>
      <div className="page-content fade-in">
        {error && <div className="error-banner mb-4">{error}</div>}

        <div className="grid-3 mb-4">
          <div className="card stat-card">
            <div className="card-title">Total Members</div>
            <div className="card-value">{stats?.member_count ?? '—'}</div>
          </div>
          <div className="card stat-card">
            <div className="card-title">Chat Access</div>
            <div className="card-value" style={{ color: 'var(--cyan)' }}>
              {users.filter((u: any) => u.chat_allowed).length}
            </div>
          </div>
          <div className="card stat-card">
            <div className="card-title">Pending</div>
            <div className="card-value" style={{ color: 'var(--warning)' }}>
              {users.filter((u: any) => !u.chat_allowed && u.role !== 'leader').length}
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card slide-up">
            <div className="card-title mb-4">Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="#/admin/members" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                Manage Members
              </a>
              <a href="#/admin/create" className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                Create Content
              </a>
            </div>
          </div>

          <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-title mb-4">Recent Activity</div>
            <div className="text-muted text-sm">
              <div style={{ marginBottom: 4 }}>{plans.length} plans active</div>
              <div style={{ marginBottom: 4 }}>{announcements.length} announcements posted</div>
              <div>{users.length} registered members</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
