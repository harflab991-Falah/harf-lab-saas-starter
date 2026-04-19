import React from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './components/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClientDashboardPage from './pages/ClientDashboardPage'
import NewOrderPage from './pages/NewOrderPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import AdminOrdersPage from './pages/AdminOrdersPage'
import TrackOrderPage from './pages/TrackOrderPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page"><p>Loading...</p></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, profile, loading, profileLoading } = useAuth()

  console.log('AdminRoute state:', { user, profile, loading, profileLoading })

  if (loading || profileLoading) {
    return (
      <div className="page">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="page">
        <p>تعذر تحميل بيانات المستخدم.</p>
      </div>
    )
  }

  if (profile.role !== 'admin') {
    return <Navigate to="/app" replace />
  }

  return children
}

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="brand">Harf Lab SaaS</div>
        <nav>
          <NavLink to="/">الرئيسية</NavLink>
          <NavLink to="/app">لوحة العميل</NavLink>
          <NavLink to="/app/orders/new">طلب جديد</NavLink>
          <NavLink to="/admin/orders">الإدارة</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/track/:id" element={<TrackOrderPage />} />
        <Route path="/app" element={<ProtectedRoute><ClientDashboardPage /></ProtectedRoute>} />
        <Route path="/app/orders/new" element={<NewOrderPage />} />
        <Route path="/app/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
        <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboardPage />
    </AdminRoute>
  }
/>
        <Route
  path="/admin/orders"
  element={
    <AdminRoute>
      <AdminOrdersPage />
    </AdminRoute>
  }
/>

<Route
  path="/admin/orders/:id"
  element={
    <AdminRoute>
      <AdminOrderDetailsPage />
    </AdminRoute>
  }
/>
      </Routes>
    </>
  )
}
