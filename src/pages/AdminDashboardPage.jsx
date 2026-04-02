import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOrders } from '../lib/api'

function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await getAdminOrders()
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const metrics = useMemo(() => {
    return {
      total: orders.length,
      newOrders: orders.filter((o) => o.status === 'new').length,
      awaitingPayment: orders.filter((o) => o.status === 'awaiting_payment').length,
      inProgress: orders.filter((o) => o.status === 'in_progress').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      revenue: orders.reduce((sum, o) => sum + Number(o.price || 0), 0),
    }
  }, [orders])

  const latestOrders = useMemo(() => {
    return [...orders].slice(0, 5)
  }, [orders])

const attentionOrders = useMemo(() => {
  return orders.filter((order) => {
    const waitingPayment = order.status === 'awaiting_payment'
    const newOrder = order.status === 'new'
    const deliveredWithoutLink =
      order.status === 'delivered' && !order.delivery_link

    return waitingPayment || newOrder || deliveredWithoutLink
  }).slice(0, 6)
}, [orders])

function getAttentionLabel(order) {
  if (order.status === 'awaiting_payment') return 'بانتظار الدفع'
  if (order.status === 'new') return 'طلب جديد يحتاج بدء العمل'
  if (order.status === 'delivered' && !order.delivery_link) {
    return 'تم التسليم بدون رابط تسليم'
  }
  return 'يحتاج مراجعة'
}

  return (
    <main className="page">
      <div className="dashboardHero">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1>لوحة تحكم الإدارة</h1>
          <p className="muted">
            نظرة سريعة على أداء الطلبات وحالة التنفيذ داخل حرف لاب.
          </p>
        </div>

        <div className="dashboardQuickLinks">
          <Link to="/admin/orders" className="buttonLink">
            إدارة الطلبات
          </Link>
          <Link to="/app" className="buttonLink">
            عرض لوحة العميل
          </Link>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="adminStatsGrid">
            <div className="adminStatCard">
              <span>إجمالي الطلبات</span>
              <strong>{metrics.total}</strong>
            </div>

            <div className="adminStatCard">
              <span>طلبات جديدة</span>
              <strong>{metrics.newOrders}</strong>
            </div>

            <div className="adminStatCard">
              <span>بانتظار الدفع</span>
              <strong>{metrics.awaitingPayment}</strong>
            </div>

            <div className="adminStatCard">
              <span>قيد التنفيذ</span>
              <strong>{metrics.inProgress}</strong>
            </div>

            <div className="adminStatCard">
              <span>تم التسليم</span>
              <strong>{metrics.delivered}</strong>
            </div>

            <div className="adminStatCard">
              <span>الإيرادات</span>
              <strong>{metrics.revenue} ر.س</strong>
            </div>
          </div>

          <div className="dashboardGrid">
            <div className="card">
              <h3 className="sectionTitle">آخر الطلبات</h3>

              {latestOrders.length > 0 ? (
                <div className="latestOrdersList">
                  {latestOrders.map((order) => (
                    <div key={order.id} className="latestOrderItem">
                      <div>
                        <strong>{order.title}</strong>
                        <p className="muted">
                          {order.profiles?.full_name || 'عميل'} — {order.services?.name || 'خدمة'}
                        </p>
                           <p className="muted">تم الإنشاء: {formatDateTime(order.created_at)}</p>
                      </div>

                      <Link to={`/admin/orders/${order.id}`}>فتح</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p>لا توجد طلبات حتى الآن.</p>
              )}
            </div>


            <div className="card">
              <h3 className="sectionTitle">روابط سريعة</h3>

              <div className="quickLinksList">
                <Link to="/admin/orders" className="quickLinkCard">
                  عرض كل الطلبات
                </Link>

                <Link to="/admin/orders" className="quickLinkCard">
                  الطلبات بانتظار الدفع
                </Link>

                <Link to="/admin/orders" className="quickLinkCard">
                  الطلبات المسلّمة
                </Link>

                <Link to="/app/orders/new" className="quickLinkCard">
                  فتح نموذج طلب جديد
                </Link>
              </div>
            </div>
          </div>
<div className="card">
  <h3 className="sectionTitle">طلبات تحتاج انتباه</h3>

  {attentionOrders.length > 0 ? (
    <div className="latestOrdersList">
      {attentionOrders.map((order) => (
        <div key={order.id} className="latestOrderItem">
          <div>
            <strong>{order.title}</strong>
            <p className="muted">
              {order.profiles?.full_name || 'عميل'} — {getAttentionLabel(order)}
            </p>
           <p className="muted">تم الإنشاء: {formatDateTime(order.created_at)}</p>
          </div>

          <Link to={`/admin/orders/${order.id}`}>فتح</Link>
        </div>
      ))}
    </div>
  ) : (
    <p>لا توجد طلبات تحتاج انتباه حاليًا.</p>
  )}
</div>

        </>
      )}
    </main>
  )
}