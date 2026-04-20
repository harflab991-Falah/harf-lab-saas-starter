import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../lib/api'

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

export default function TrackOrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      setLoading(true)
      setError('')

      const { data, error } = await getOrderById(id)

      if (error) {
        setError(error.message)
        setOrder(null)
        setLoading(false)
        return
      }

      setOrder(data || null)
      setLoading(false)
    }

    loadOrder()
  }, [id])

  if (loading) {
    return (
      <main className="page narrow">
        <div className="card">
          <p>جاري تحميل الطلب...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page narrow">
        <div className="card">
          <p className="error">{error}</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="page narrow">
        <div className="card">
          <p>لم يتم العثور على الطلب.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page narrow">
      <div className="card">
        <h2>متابعة الطلب</h2>

        <p><strong>رقم الطلب:</strong> {order.id}</p>

        <div className="statusRow">
          <span>الحالة:</span>
          <span className={statusClasses[order.status] || 'badge'}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <p><strong>اسم العميل:</strong> {order.customer_name || order.profiles?.full_name || '—'}</p>
        <p><strong>رقم الجوال:</strong> {order.customer_phone || order.profiles?.phone || '—'}</p>
        <p><strong>الخدمة:</strong> {order.services?.name || '—'}</p>
        <p><strong>عنوان الطلب:</strong> {order.title || '—'}</p>
        <p><strong>وصف الطلب:</strong> {order.description || '—'}</p>
        <p><strong>السعر:</strong> {order.price ?? '—'} ر.س</p>
        <p><strong>المقاس:</strong> {order.size || '—'}</p>
        <p><strong>الستايل:</strong> {order.style || '—'}</p>
        <p><strong>تاريخ ووقت إنشاء الطلب:</strong> {formatDateTime(order.created_at)}</p>

        <h3 className="sectionTitle">الدفع</h3>

        {order.payment_link ? (
          <div className="deliveryBox">
            <p>لإتمام الطلب، استخدم رابط الدفع التالي:</p>
            <a href={order.payment_link} target="_blank" rel="noreferrer">
              ادفع الآن
            </a>
          </div>
        ) : (
          <p>لم يتم إضافة رابط الدفع بعد.</p>
        )}

        <h3 className="sectionTitle">التسليم</h3>

        {order.delivery_link ? (
          <div className="deliveryBox">
            <p>تم تجهيز الطلب ويمكنك فتح رابط التسليم من هنا:</p>
            <a href={order.delivery_link} target="_blank" rel="noreferrer">
              فتح رابط التسليم
            </a>
          </div>
        ) : (
          <p>لم يتم إضافة رابط التسليم بعد.</p>
        )}
      </div>
    </main>
  )
}