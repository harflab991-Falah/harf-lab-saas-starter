import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../lib/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    const { error } = await signUp(form)
    if (error) return setError(error.message)
    setMessage('تم إنشاء الحساب. تحقق من بريدك الإلكتروني إذا كان التفعيل مطلوبًا.')
    setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <main className="page narrow">
      <div className="card">
        <h2>إنشاء حساب</h2>
        <form onSubmit={onSubmit} className="stack">
          <input placeholder="الاسم الكامل" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder="رقم الجوال" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="primary">إنشاء الحساب</button>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="success">{message}</p> : null}
        </form>
      </div>
    </main>
  )
}
