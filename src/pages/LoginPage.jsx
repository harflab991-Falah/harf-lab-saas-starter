import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(form)
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/app')
  }

  return (
    <main className="page narrow">
      <div className="card">
        <h2>تسجيل الدخول</h2>
        <form onSubmit={onSubmit} className="stack">
          <input placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="كلمة المرور" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="primary" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </div>
    </main>
  )
}
