import { useEffect, useState, useRef, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../store/auth'

export default function AdminMembers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', chat_allowed: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const loadIdRef = useRef(0)

  const load = useCallback(() => {
    const id = ++loadIdRef.current
    setLoading(true)
    setError('')
    api.getUsers()
      .then((data) => {
        if (id === loadIdRef.current) setUsers(data)
      })
      .catch(() => {
        if (id === loadIdRef.current) setError('Failed to load members')
      })
      .finally(() => {
        if (id === loadIdRef.current) setLoading(false)
      })
  }, [])

  useEffect(() => { load() }, [load])

  if (user?.role !== 'leader') return <Navigate to="/" replace />

  const createUser = async () => {
    if (!newUser.username || !newUser.password || submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.createUser(newUser.username, newUser.password, newUser.chat_allowed)
      setNewUser({ username: '', password: '', chat_allowed: false })
      setShowCreate(false)
      load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleChat = async (id: number, current: boolean) => {
    try {
      await api.updateUser(id, { chat_allowed: !current })
      setError('')
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.deleteUser(id)
      setError('')
      load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Members</h1>
            <p className="subtitle">Manage team accounts and permissions.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : 'Add Member'}
          </button>
        </div>
      </div>
      <div className="page-content">
        {error && <div className="error-banner mb-4">{error}</div>}

        {showCreate && (
          <div className="card mb-4 slide-up">
            <div className="card-title mb-4">New Member</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="input" placeholder="Username" value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} disabled={submitting} />
              <input className="input" type="password" placeholder="Password" value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} disabled={submitting} />
              <label className="flex items-center gap-2 text-sm" style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={newUser.chat_allowed}
                  onChange={(e) => setNewUser({ ...newUser, chat_allowed: e.target.checked })} />
                Grant chat access immediately
              </label>
              <button className="btn btn-primary" onClick={createUser} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="card"><div className="skeleton" style={{ height: 200 }} /></div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Username</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Role</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Chat</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Joined</th>
                    <th style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="font-mono" style={{ fontSize: 13 }}>{u.username || ''}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.role === 'leader' ? (
                          <span style={{ color: 'var(--accent)', fontSize: 12 }}>Leader</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Member</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-dot ${u.chat_allowed ? 'green' : 'red'}`} />
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                          {u.role !== 'leader' && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => toggleChat(u.id, u.chat_allowed)}>
                                {u.chat_allowed ? 'Revoke Chat' : 'Grant Chat'}
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
