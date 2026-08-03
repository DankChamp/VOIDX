import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface Plan {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  author: string
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.getPlans()
      .then(setPlans)
      .catch(() => setError('Failed to load plans'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-header">
        <h1>The Blueprint</h1>
        <p className="subtitle">Strategic plans and directives from leadership.</p>
      </div>
      <div className="page-content">
        {error && <div className="error-banner mb-4">{error}</div>}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map((i) => (
              <div key={i} className="card"><div className="skeleton" style={{ height: 100 }} /></div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="icon">△</div>
            <div>No plans have been dropped yet.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="fade-in">
            {plans.map((p, i) => (
              <div key={p.id} className="card plan-card" style={{ cursor: 'pointer', borderLeft: '2px solid var(--accent)', animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/plans/${p.id}`)}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{p.title || ''}</div>
                <div className="text-muted text-sm" style={{ marginBottom: 8 }}>
                  {p.content?.slice(0, 250)}{p.content?.length > 250 ? '...' : ''}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{p.author || ''}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
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
