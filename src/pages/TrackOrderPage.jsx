import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../lib/api'

export default function TrackOrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrderById(id).then(({ data, error }) => {
      if (error) return setError(error.message)
      setOrder(data)
    })
  }, [id])

  return (
    <main className="page narrow">
      <div className="card">
        <h2>تتبع الطلب</h2>
        {error ? <p className="error">{error}</p> : null}
        {order ? (
          <>
            <p>عنوان الطلب: <strong>{order.title}</strong></p>
            <p>الحالة: <strong>{order.status}</strong></p>
            <p>السعر: {order.price ?? '—'}</p>
            <p>رابط التسليم: {order.delivery_link ? <a href={order.delivery_link} target="_blank" rel="noreferrer">فتح الرابط</a> : 'غير متوفر بعد'}</p>
          </>
        ) : !error ? <p>Loading...</p> : null}
      </div>
    </main>
  )
}
