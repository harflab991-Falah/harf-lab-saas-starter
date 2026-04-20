import { supabase } from './supabaseClient'

/* =========================
   SERVICES
========================= */

export async function getServices() {
  return supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
}

/* =========================
   ORDERS
========================= */

// إنشاء طلب (يدعم الضيف)
export async function createOrder(payload) {
  return supabase
    .from('orders')
    .insert(payload)
    .select()
    .single()
}

// جلب طلب بالتفاصيل (مهم لصفحة التتبع)
export async function getOrderById(id) {
  return supabase
    .from('orders')
    .select(`
      *,
      services (
        name,
        base_price
      ),
      profiles (
        full_name,
        phone
      )
    `)
    .eq('id', id)
    .single()
}

// جلب كل الطلبات (للإدارة)
export async function getAllOrders() {
  return supabase
    .from('orders')
    .select(`
      *,
      services (name),
      profiles (full_name)
    `)
    .order('created_at', { ascending: false })
}

/* =========================
   UPDATE ORDER
========================= */

export async function updateOrder(id, updates) {
  return supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

/* =========================
   FILES
========================= */

// رفع ملف (يدعم الضيف)
export async function uploadOrderFile({ orderId, file }) {
  const filePath = `${orderId}/${Date.now()}-${file.name}`

  const upload = await supabase.storage
    .from('order-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (upload.error) return upload

  return supabase.from('order_files').insert({
    order_id: orderId,
    file_path: filePath,
    file_name: file.name,
    content_type: file.type,
  })
}

// جلب ملفات الطلب
export async function getOrderFiles(orderId) {
  return supabase
    .from('order_files')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
}