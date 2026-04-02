import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getServices, uploadOrderFile } from '../lib/api'
import { useAuth } from '../components/AuthContext'

export default function NewOrderPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ service_id: '', title: '', description: '', size: '', style: '' })
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    getServices().then(({ data }) => setServices(data || []))
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const selected = services.find((s) => s.id === form.service_id)
    const payload = {
      client_id: user.id,
      service_id: form.service_id || null,
      title: form.title,
      description: form.description,
      size: form.size,
      style: form.style,
      price: selected?.base_price ?? null,
      deadline_at: selected?.turnaround_hours ? new Date(Date.now() + selected.turnaround_hours * 3600 * 1000).toISOString() : null,
    }
    const { data, error } = await createOrder(payload)
if (error) return setError(error.message)

// إذا اختار المستخدم ملفًا، ارفعه بعد إنشاء الطلب
if (file && data) {
  const uploadResult = await uploadOrderFile({
    orderId: data.id,
    file,
    userId: user.id
  })

  if (uploadResult.error) {
    return setError(uploadResult.error.message)
  }
}

navigate(`/app/orders/${data.id}`)
  }

  return (
    <main className="page narrow">
      <div className="card">
        <h2>إنشاء طلب جديد</h2>
        <form onSubmit={onSubmit} className="stack">
          <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
            <option value="">اختر الخدمة</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name} — {service.base_price ?? '—'} ر.س</option>
            ))}
          </select>
          <input placeholder="عنوان الطلب" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="وصف الطلب" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="المقاس" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
          <input placeholder="الستايل" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} />
<input
  type="file"
  onChange={(e) => setFile(e.target.files[0])}
/>
          <button className="primary">إرسال الطلب</button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </div>
    </main>
  )
}
