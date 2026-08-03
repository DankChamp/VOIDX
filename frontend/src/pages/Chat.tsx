import { useEffect, useState, useRef, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../store/auth'

interface Message {
  id: number
  user_id: number
  username: string
  content_sanitized: string
  created_at: string
}

export default function Chat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const maxIdRef = useRef(0)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>()
  const mountedRef = useRef(true)

  const chatAllowed = user?.chat_allowed || user?.role === 'leader'

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token || !chatAllowed || !mountedRef.current) return

    const ws = new WebSocket(api.wsUrl())
    wsRef.current = ws

    ws.onopen = () => {
      if (mountedRef.current) setConnected(true)
    }

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'message' && data.id > maxIdRef.current) {
          maxIdRef.current = data.id
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev
            return [...prev, {
              id: data.id,
              user_id: data.user_id,
              username: data.username,
              content_sanitized: data.content,
              created_at: data.created_at,
            }]
          })
        }
      } catch {}
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnected(false)
      wsRef.current = null
      reconnectRef.current = setTimeout(() => connect(), 3000)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [chatAllowed])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!chatAllowed) {
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    api.getMessages()
      .then((msgs) => {
        setMessages(msgs)
        if (msgs.length > 0) maxIdRef.current = Math.max(...msgs.map((m: Message) => m.id))
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load messages')
        setLoading(false)
      })

    connect()

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.onerror = null
        wsRef.current.onmessage = null
        wsRef.current.onopen = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [chatAllowed, connect])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ content: input }))
    setInput('')
  }

  if (!chatAllowed) {
    return (
      <>
        <div className="page-header">
          <h1>The Void</h1>
          <p className="subtitle">Real-time communication channel.</p>
        </div>
        <div className="page-content">
          <div className="empty-state fade-in">
            <div className="icon">🔇</div>
            <div style={{ fontSize: 16, marginBottom: 8, color: '#e8e8f0' }}>Access Restricted</div>
            <div>The leader has not granted you access to The Void yet.</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>The Void</h1>
            <p className="subtitle">All messages are AI-sanitized for anonymity.</p>
          </div>
          <span className="flex items-center gap-2 text-sm">
            <span className={`status-dot ${connected ? 'green' : 'red'}`} />
            <span className="text-muted">{connected ? 'Connected' : 'Reconnecting...'}</span>
          </span>
        </div>
      </div>
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 12 }}>
          {loading ? (
            <div className="empty-state">
              <div className="spinner" />
              <div className="text-muted">Loading messages...</div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="icon" style={{ color: 'var(--danger)' }}>⚠</div>
              <div style={{ color: 'var(--danger)' }}>{error}</div>
              <button className="btn btn-ghost btn-sm mt-4" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="icon">◈</div>
              <div style={{ color: 'var(--text-muted)' }}>No messages yet. Speak into the void.</div>
            </div>
          ) : (
            <div className="fade-in">
              {messages.map((m) => (
                <div key={m.id} className="chat-message" data-own={m.user_id === user?.id || undefined}>
                  <span className="chat-username">{m.username}</span>
                  <span className="chat-content">{m.content_sanitized || ''}</span>
                  <span className="chat-time">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type your message..."
            disabled={!connected}
          />
          <button className="btn btn-primary" onClick={send} disabled={!connected || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </>
  )
}
