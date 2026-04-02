import React from 'react'

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Harf Lab</p>
          <h1>نظام SaaS فعلي لإدارة طلبات التصميم والمونتاج</h1>
          <p className="muted">تسجيل دخول، طلبات، رفع ملفات، لوحة عميل، لوحة إدارة، وتتبع مباشر للطلبات.</p>
        </div>
      </section>
      <section className="grid3">
        <article className="card"><h3>طلب خدمة</h3><p>إنشاء طلب حقيقي داخل قاعدة البيانات.</p></article>
        <article className="card"><h3>لوحة إدارة</h3><p>متابعة الطلبات من جديد حتى التسليم.</p></article>
        <article className="card"><h3>تتبع عميل</h3><p>عرض حالة الطلب وروابط التسليم.</p></article>
      </section>
    </main>
  )
}
