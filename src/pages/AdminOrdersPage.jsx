import React, { useEffect, useMemo, useState } from 'react'
import { getAdminOrders, updateOrder } from '../lib/api'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

const statuses = ['new', 'pricing', 'awaiting_payment', 'in_progress', 'review', 'revisions', 'delivered', 'cancelled']

const statusLabels = {
  new: 'طلب جديد',
  pricing: 'التسعير',
  awaiting_payment: 'بانتظار الدفع',
  in_progress: 'قيد التنفيذ',
  review: 'المراجعة',
  revisions: 'التعديلات',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const statusClasses = {
  new: 'badge badgeSlate',
  pricing: 'badge badgeViolet',
  awaiting_payment: 'badge badgeAmber',
  in_progress: 'badge badgeSky',
  review: 'badge badgeOrange',
  revisions: 'badge badgePink',
  delivered: 'badge badgeGreen',
  cancelled: 'badge badgeRed',
}

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [deliveryInputs, setDeliveryInputs] = useState({})
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

const metrics = useMemo(() => {
  return {
    total: orders.length,
    newOrders: orders.filter((o) => o.status === 'new').length,
    inProgress: orders.filter((o) => o.status === 'in_progress').length,
    awaitingPayment: orders.filter((o) => o.status === 'awaiting_payment').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + Number(o.price || 0), 0),
  }
}, [orders])

const filteredOrders = useMemo(() => {
  if (activeFilter === 'all') return orders
  return orders.filter((order) => order.status === activeFilter)
}, [orders, activeFilter])

const searchedOrders = useMemo(() => {
  const query = searchTerm.trim().toLowerCase()

  if (!query) return filteredOrders

  return filteredOrders.filter((order) => {
    const clientName = order.profiles?.full_name?.toLowerCase() || ''
    const phone = order.profiles?.phone?.toLowerCase() || ''
    const title = order.title?.toLowerCase() || ''

    return (
      clientName.includes(query) ||
      phone.includes(query) ||
      title.includes(query)
    )
  })
}, [filteredOrders, searchTerm])


async function load() {
  setLoading(true)
  const { data } = await getAdminOrders()
  const rows = data || []
  setOrders(rows)

  const initialLinks = {}
  rows.forEach((order) => {
    initialLinks[order.id] = order.delivery_link || ''
  })
  setDeliveryInputs(initialLinks)

  setLoading(false)
}
  useEffect(() => { load() }, [])

  async function onStatusChange(id, status) {
    await updateOrder(id, { status })
    load()
  }

async function onSaveDeliveryLink(orderId) {
  const link = deliveryInputs[orderId] || ''

  if (!link.trim()) {
    alert('أدخل رابط التسليم أولاً')
    return
  }

  const { error } = await updateOrder(orderId, {
    delivery_link: link,
    status: 'delivered'
  })

  if (error) {
    alert(error.message)
    return
  }

  await load()
  alert('تم حفظ رابط التسليم وتحديث الحالة إلى delivered')
}

  return (
    <main className="page">
      <h2>لوحة الإدارة — الطلبات</h2>
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
    <span>قيد التنفيذ</span>
    <strong>{metrics.inProgress}</strong>
  </div>

  <div className="adminStatCard">
    <span>بانتظار الدفع</span>
    <strong>{metrics.awaitingPayment}</strong>
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
<div className="filterTabs">
  <button
    className={activeFilter === 'all' ? 'filterTab active' : 'filterTab'}
    onClick={() => setActiveFilter('all')}
  >
    كل الطلبات
  </button>

  <button
    className={activeFilter === 'new' ? 'filterTab active' : 'filterTab'}
    onClick={() => setActiveFilter('new')}
  >
    طلبات جديدة
  </button>

  <button
    className={activeFilter === 'awaiting_payment' ? 'filterTab active' : 'filterTab'}
    onClick={() => setActiveFilter('awaiting_payment')}
  >
    بانتظار الدفع
  </button>

  <button
    className={activeFilter === 'in_progress' ? 'filterTab active' : 'filterTab'}
    onClick={() => setActiveFilter('in_progress')}
  >
    قيد التنفيذ
  </button>

  <button
    className={activeFilter === 'delivered' ? 'filterTab active' : 'filterTab'}
    onClick={() => setActiveFilter('delivered')}
  >
    تم التسليم
  </button>
</div>

<div className="searchBarWrap">
  <input
    type="text"
    className="searchBarInput"
    placeholder="ابحث باسم العميل أو الجوال أو عنوان الطلب"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

      {loading ? <p>Loading...</p> : (
        <div className="grid2">
{searchedOrders.map((order) => (
            <article key={order.id} className="card">
              <h3>{order.title}</h3>
              <p>العميل: {order.profiles?.full_name || '—'}</p>
              <p>الجوال: {order.profiles?.phone || '—'}</p>
              <p>الخدمة: {order.services?.name || '—'}</p>
              <p>السعر: {order.price ?? '—'}</p>
              <p className="muted">تم إنشاء الطلب: {formatDateTime(order.created_at)}</p>

<div className="statusRow">
  <span>الحالة الحالية:</span>
  <span className={statusClasses[order.status] || 'badge'}>
    {statusLabels[order.status] || order.status}
  </span>
</div>

<div className="stack">
  <strong>الملفات المرفوعة</strong>

  {order.order_files?.length > 0 ? (
    <div className="filesList">
      {order.order_files.map((file) => {
        const { data } = supabase.storage
          .from('order-files')
          .getPublicUrl(file.file_path)

        return (
          <div key={file.id} className="fileCard">
            <div>
              <strong>{file.file_name}</strong>
              <p className="muted">ملف مرفوع من العميل</p>
            </div>

            <a href={data.publicUrl} target="_blank" rel="noreferrer">
              فتح الملف
            </a>
          </div>
        )
      })}
    </div>
  ) : (
    <span className="muted">لا يوجد ملفات</span>
  )}
</div>

<div className="stack">
  <strong>رابط التسليم النهائي</strong>

  <input
    type="text"
    placeholder="ضع رابط Google Drive أو أي رابط تسليم"
    value={deliveryInputs[order.id] || ''}
    onChange={(e) =>
      setDeliveryInputs({
        ...deliveryInputs,
        [order.id]: e.target.value
      })
    }
  />

  <button onClick={() => onSaveDeliveryLink(order.id)}>
    حفظ رابط التسليم
  </button>

{order.delivery_link ? (
  <a href={order.delivery_link} target="_blank" rel="noreferrer">
    فتح رابط التسليم الحالي
  </a>
) : (
  <span className="muted">لا يوجد رابط تسليم محفوظ بعد</span>
)}

</div>

<Link to={`/admin/orders/${order.id}`}>فتح تفاصيل الطلب</Link>

              <label className="stack">
                <span>الحالة</span>
                <select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value)}>
                  {statuses.map((status) => <option key={status} value={status}>{statusLabels[status] || status}     </option>)}
                </select>
              </label>
            </article>
          ))}
          {searchedOrders.length === 0 ? <p>لا توجد نتائج مطابقة.</p> : null}
        </div>
      )}
    </main>
  )
}
