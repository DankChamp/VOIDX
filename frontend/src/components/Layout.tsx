import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

const navItems = [
  { to: '/', label: 'Observatory', icon: '◇' },
  { to: '/chat', label: 'The Void', icon: '◆' },
  { to: '/forum', label: 'The Echo', icon: '○' },
  { to: '/plans', label: 'The Blueprint', icon: '△' },
  { to: '/announcements', label: 'The Signal', icon: '◎' },
]

const adminItems = [
  { to: '/admin', label: 'The Throne', icon: '⚙' },
  { to: '/admin/members', label: 'Members', icon: '◈' },
  { to: '/admin/create', label: 'Create', icon: '+' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setSidebarOpen(false)
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">VOIDX</div>

        <div className="sidebar-section">Navigation</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user?.role === 'leader' && (
          <>
            <div className="sidebar-section">Command</div>
            <nav className="sidebar-nav">
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="text-sm text-muted">{user?.username}</span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Exit</button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <span className="hamburger" />
          </button>
          <span className="mobile-brand">VOIDX</span>
        </div>
        <Outlet />
      </main>
    </div>
  )
}
