import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getServices } from '../lib/api'

export default function NewOrderPage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    service_id: '',
    title: '',
    description: '',
    size: '',
    style: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await getServices()

      if (error) {
        setError(error.message)
        return
      }

      setServices(data || [])
    }

    loadServices()
  }, [])

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.customer_name.trim()) {
      setError('يرجى إدخال اسم العميل')
      return
    }

    if (!form.customer_phone.trim()) {
      setError('يرجى إدخال رقم الجوال')
      return
    }

    if (!form.service_id) {
      setError('يرجى اختيار الخدمة')
      return
    }

    if (!form.title.trim()) {
      setError('يرجى إدخال عنوان الطلب')
      return
    }

    const selectedService = services.find((service) => service.id === form.service_id)

    const payload = {
      service_id: form.service_id || null,
      title: form.title.trim(),
      description: form.description.trim(),
      size: form.size.trim(),
      style: form.style.trim(),
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      price: selectedService?.base_price ?? null,
      deadline_at: selectedService?.turnaround_hours
        ? new Date(Date.now() + selectedService.turnaround_hours * 3600 * 1000).toISOString()
        : null,
      status: 'new',
    }

    setSubmitting(true)

    const { data, error } = await createOrder(payload)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate(`/track/${data.id}`)
  }

  return (
    <main className="page narrow">
      <div className="card">
        <h2>إنشاء طلب جديد</h2>

        <form onSubmit={onSubmit} className="stack">
          <input
            placeholder="اسم العميل"
            value={form.customer_name}
            onChange={(e) => updateField('customer_name', e.target.value)}
          />

          <input
            placeholder="رقم الجوال"
            value={form.customer_phone}
            onChange={(e) => updateField('customer_phone', e.target.value)}
          />

          <select
            value={form.service_id}
            onChange={(e) => updateField('service_id', e.target.value)}
          >
            <option value="">اختر الخدمة</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — {service.base_price ?? '—'} ر.س
              </option>
            ))}
          </select>

          <input
            placeholder="عنوان الطلب"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <textarea
            placeholder="وصف الطلب"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={6}
          />

          <input
            placeholder="المقاس"
            value={form.size}
            onChange={(e) => updateField('size', e.target.value)}
          />

          <input
            placeholder="الستايل"
            value={form.style}
            onChange={(e) => updateField('style', e.target.value)}
          />

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>
      </div>
    </main>
  )
}