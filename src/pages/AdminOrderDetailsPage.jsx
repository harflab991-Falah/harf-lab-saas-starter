import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById, updateOrder } from '../lib/api'
import { supabase } from '../lib/supabase'

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

export default function AdminOrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusValue, setStatusValue] = useState('')
  const [deliveryLinkValue, setDeliveryLinkValue] = useState('')
  const [saving, setSaving] = useState(false)
const [paymentLinkValue, setPaymentLinkValue] = useState('')

 useEffect(() => {
  async function load() {
    setLoading(true)
    const { data } = await getOrderById(id)
    const currentOrder = data || null

    setOrder(currentOrder)
    setStatusValue(currentOrder?.status || '')
    setDeliveryLinkValue(currentOrder?.delivery_link || '')
    setPaymentLinkValue(currentOrder?.payment_link || '')
    setLoading(false)

  }

  load()
}, [id])

  if (loading) {
    return (
      <main className="page">
        <p>Loading...</p>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="page">
        <p>لم يتم العثور على الطلب.</p>
      </main>
    )
  }

async function onSaveChanges() {
  if (!order) return

  setSaving(true)

  const { data, error } = await updateOrder(order.id, {
  status: statusValue,
  delivery_link: deliveryLinkValue,
  payment_link: paymentLinkValue,
})


  if (error) {
    alert(error.message)
    setSaving(false)
    return
  }

  setOrder(data || order)
console.log('order details:', data)
  setSaving(false)
  alert('تم حفظ التعديلات بنجاح')
}

  return (
    <main className="page">
      <div className="card">
        <h2>{order.title}</h2>

        <div className="statusRow">
          <span>الحالة:</span>
          <span className={statusClasses[order.status] || 'badge'}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
        <p><strong>اسم العميل:</strong> {order.profiles?.full_name || '—'}</p>
        <p><strong>رقم الجوال:</strong> {order.profiles?.phone || '—'}</p>
        <p>الخدمة: {order.services?.name || '—'}</p>
        <p>الوصف: {order.description || '—'}</p>
        <p>السعر: {order.price ?? '—'} ر.س</p>
        <p>تاريخ ووقت إنشاء الطلب: {formatDateTime(order.created_at)}</p>
        <p>المقاس: {order.size || '—'}</p>
        <p>الستايل: {order.style || '—'}</p>
        <p>
          رابط التسليم:{' '}
          {order.delivery_link ? (
            <a href={order.delivery_link} target="_blank" rel="noreferrer">
              فتح رابط التسليم
            </a>
          ) : '—'}
        </p>

<h3 className="sectionTitle">إدارة الطلب</h3>

<div className="stack">
  <label className="stack">
    <span>الحالة</span>
    <select
      value={statusValue}
      onChange={(e) => setStatusValue(e.target.value)}
    >
      <option value="new">طلب جديد</option>
      <option value="pricing">التسعير</option>
      <option value="awaiting_payment">بانتظار الدفع</option>
      <option value="in_progress">قيد التنفيذ</option>
      <option value="review">المراجعة</option>
      <option value="revisions">التعديلات</option>
      <option value="delivered">تم التسليم</option>
      <option value="cancelled">ملغي</option>
    </select>
  </label>

<label className="stack">
  <span>رابط الدفع من سلة</span>
  <input
    type="text"
    placeholder="ضع رابط الدفع أو الفاتورة من سلة"
    value={paymentLinkValue}
    onChange={(e) => setPaymentLinkValue(e.target.value)}
  />
</label>

  <label className="stack">
    <span>رابط التسليم</span>
    <input
      type="text"
      placeholder="ضع رابط Google Drive أو Dropbox أو أي رابط تسليم"
      value={deliveryLinkValue}
      onChange={(e) => setDeliveryLinkValue(e.target.value)}
    />
  </label>

  <button className="primary" onClick={onSaveChanges} disabled={saving}>
    {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
  </button>
</div>

        <h3 className="sectionTitle">الملفات المرفوعة</h3>

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
          <p>لا يوجد ملفات مرفوعة.</p>
        )}
      </div>
    </main>
  )
}