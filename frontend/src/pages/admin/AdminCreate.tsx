import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../store/auth'

export default function AdminCreate() {
  const { user } = useAuth()

  const [plan, setPlan] = useState({ title: '', content: '' })
  const [announcement, setAnnouncement] = useState({ title: '', content: '', is_pinned: false })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [planSubmitting, setPlanSubmitting] = useState(false)
  const [annSubmitting, setAnnSubmitting] = useState(false)

  if (user?.role !== 'leader') return <Navigate to="/" replace />

  const createPlan = async () => {
    if (!plan.title || !plan.content || planSubmitting) return
    setPlanSubmitting(true)
    setError('')
    setMessage('')
    try {
      await api.createPlan(plan.title, plan.content)
      setPlan({ title: '', content: '' })
      setMessage('Plan created successfully.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPlanSubmitting(false)
    }
  }

  const createAnnouncement = async () => {
    if (!announcement.title || !announcement.content || annSubmitting) return
    setAnnSubmitting(true)
    setError('')
    setMessage('')
    try {
      await api.createAnnouncement(announcement.title, announcement.content, announcement.is_pinned)
      setAnnouncement({ title: '', content: '', is_pinned: false })
      setMessage('Announcement posted.')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnnSubmitting(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Create</h1>
        <p className="subtitle">Drop plans and broadcast signals.</p>
      </div>
      <div className="page-content fade-in">
        {message && (
          <div className="success-banner mb-4 flex items-center justify-between">
            <span>{message}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setMessage('')}>Dismiss</button>
          </div>
        )}
        {error && (
          <div className="error-banner mb-4">{error}</div>
        )}

        <div className="grid-2">
          <div className="card slide-up">
            <div className="card-title mb-4">New Blueprint (Plan)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Plan title" value={plan.title}
                onChange={(e) => setPlan({ ...plan, title: e.target.value })} disabled={planSubmitting} />
              <textarea className="input textarea" placeholder="Plan details..." rows={8} value={plan.content}
                onChange={(e) => setPlan({ ...plan, content: e.target.value })} disabled={planSubmitting} />
              <button className="btn btn-primary" onClick={createPlan} disabled={planSubmitting || !plan.title || !plan.content}>
                {planSubmitting ? 'Dropping...' : 'Drop Plan'}
              </button>
            </div>
          </div>

          <div className="card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-title mb-4">New Signal (Announcement)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Announcement title" value={announcement.title}
                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} disabled={annSubmitting} />
              <textarea className="input textarea" placeholder="Announcement content..." rows={5} value={announcement.content}
                onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })} disabled={annSubmitting} />
              <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={announcement.is_pinned}
                  onChange={(e) => setAnnouncement({ ...announcement, is_pinned: e.target.checked })} />
                Pin this announcement
              </label>
              <button className="btn btn-primary" onClick={createAnnouncement} disabled={annSubmitting || !announcement.title || !announcement.content}>
                {annSubmitting ? 'Broadcasting...' : 'Broadcast'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
