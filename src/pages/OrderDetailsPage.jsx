import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../lib/api'
import { supabase } from '../lib/supabase'

const orderSteps = [
  { key: 'new', label: 'طلب جديد' },
  { key: 'pricing', label: 'التسعير' },
  { key: 'awaiting_payment', label: 'بانتظار الدفع' },
  { key: 'in_progress', label: 'قيد التنفيذ' },
  { key: 'review', label: 'المراجعة' },
  { key: 'revisions', label: 'التعديلات' },
  { key: 'delivered', label: 'تم التسليم' },
]

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

export default function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  const currentStepIndex = order
    ? orderSteps.findIndex((step) => step.key === order.status)
    : -1

  useEffect(() => {
    getOrderById(id).then(({ data }) => setOrder(data || null))
  }, [id])

  if (!order) {
    return (
      <main className="page">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="card">
        <h2>{order.title}</h2>

        <div className="timeline">
          {orderSteps.map((step, index) => {
            const active = index <= currentStepIndex

            return (
              <div
                key={step.key}
                className={`timelineStep ${active ? 'active' : ''}`}
              >
                <div className="timelineCircle">{index + 1}</div>
                <div className="timelineLabel">{step.label}</div>
              </div>
            )
          })}
        </div>

        <div className="statusRow">
          <span>الحالة:</span>
          <span className={statusClasses[order.status] || 'badge'}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <p>الخدمة: {order.services?.name || '—'}</p>
        <p>الوصف: {order.description || '—'}</p>
        <p>السعر: {order.price ?? '—'}</p>

<h3 className="sectionTitle">الدفع</h3>

{order.payment_link ? (
  <div className="deliveryBox">
    <p>لإتمام الطلب، استخدم رابط الدفع التالي:</p>

    <a href={order.payment_link} target="_blank" rel="noreferrer">
      ادفع الآن
    </a>
  </div>
) : (
  <p>لم يتم إضافة رابط الدفع بعد</p>
)}

        <h3 className="sectionTitle">رابط التسليم النهائي</h3>

{order.delivery_link ? (
  <div className="deliveryBox">
    <p>تم تجهيز العمل النهائي ويمكنك فتحه من الرابط التالي:</p>

    <a href={order.delivery_link} target="_blank" rel="noreferrer">
      فتح رابط التسليم
    </a>
  </div>
) : (
  <p>لم يتم إضافة رابط التسليم بعد</p>
)}

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
          <p>لا يوجد ملفات</p>
        )}
      </div>
    </main>
  )
}