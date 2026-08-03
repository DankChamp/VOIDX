import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './store/auth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Forum from './pages/Forum'
import ThreadDetail from './pages/ThreadDetail'
import Plans from './pages/Plans'
import PlanDetail from './pages/PlanDetail'
import Announcements from './pages/Announcements'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMembers from './pages/admin/AdminMembers'
import AdminCreate from './pages/admin/AdminCreate'

export default function App() {
  const { checkAuth, loading } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">VOIDX</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<ThreadDetail />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/create" element={<AdminCreate />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
