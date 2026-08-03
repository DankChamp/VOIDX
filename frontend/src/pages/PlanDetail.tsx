import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

interface Plan {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  author: string
}

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getPlan(Number(id))
      .then(setPlan)
      .catch(() => {
        setError('Plan not found')
        navigate('/plans')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page-content">
        <div className="empty-state"><div className="spinner" /></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="page-content">
        <div className="empty-state"><div className="text-muted">Plan not found.</div></div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div style={{ marginBottom: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/plans')}>← Back to Blueprints</button>
        </div>
        <h1>{plan.title || ''}</h1>
        <p className="subtitle font-mono" style={{ fontSize: 11 }}>
          {plan.author || ''} · {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : ''}
          {plan.updated_at !== plan.created_at && <span className="text-muted"> · Updated {plan.updated_at ? new Date(plan.updated_at).toLocaleDateString() : ''}</span>}
        </p>
      </div>
      <div className="page-content fade-in">
        <div className="card" style={{ borderLeft: '2px solid var(--accent)', padding: 24 }}>
          <div style={{ lineHeight: 1.8, fontSize: 14, whiteSpace: 'pre-wrap' }}>{plan.content || ''}</div>
        </div>
      </div>
    </>
  )
}
