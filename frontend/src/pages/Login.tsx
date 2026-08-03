import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { login, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        <div className="login-brand">
          <div className="login-logo">VOIDX</div>
          <div className="login-subtitle">Authenticate</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              disabled={submitting}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${submitting ? 'btn-disabled' : ''}`}
            style={{ width: '100%', padding: '12px 0', fontSize: 14 }}
            disabled={submitting}
          >
            {submitting ? 'Entering...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
