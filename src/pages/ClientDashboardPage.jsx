import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../lib/api'

export default function ClientDashboardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders().then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <main className="page">
      <div className="sectionHeader">
        <h2>لوحة العميل</h2>
        <Link to="/app/orders/new" className="buttonLink">طلب جديد</Link>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="grid2">
          {orders.map((order) => (
            <article key={order.id} className="card">
              <h3>{order.title}</h3>
              <p className="muted">{order.services?.name || 'خدمة'}</p>
              <p>الحالة: <strong>{order.status}</strong></p>
              <p>السعر: {order.price ?? '—'}</p>
              <Link to={`/app/orders/${order.id}`}>فتح الطلب</Link>
            </article>
          ))}
          {orders.length === 0 ? <p>لا توجد طلبات حتى الآن.</p> : null}
        </div>
      )}
    </main>
  )
}
