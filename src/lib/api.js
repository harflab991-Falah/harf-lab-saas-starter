import { supabase } from './supabase'

export async function signUp({ email, password, fullName, phone }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } }
  })
}

export async function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getServices() {
  return supabase.from('services').select('*').eq('is_active', true).order('name')
}

export async function createOrder(payload) {
  return supabase.from('orders').insert(payload).select().single()
}

export async function getMyOrders() {
  return supabase.from('orders').select('*, services(name)').order('created_at', { ascending: false })
}

export async function getOrderById(id) {
  return supabase
    .from('orders')
    .select('*, profiles(full_name, phone), services(name), order_files(*), payments(*), deliveries(*)')
    .eq('id', id)
    .single()
}

export async function getAdminOrders() {
  return supabase
    .from('orders')
    .select('*, profiles(full_name, phone), services(name), order_files(*)')
    .order('created_at', { ascending: false })
}

export async function updateOrder(id, payload) {
  return supabase.from('orders').update(payload).eq('id', id).select().single()
}

export async function uploadOrderFile({ orderId, file, userId }) {
  const filePath = `${orderId}/${Date.now()}-${file.name}`
  const upload = await supabase.storage.from('order-files').upload(filePath, file, { cacheControl: '3600', upsert: false })
  if (upload.error) return upload
  return supabase.from('order_files').insert({
    order_id: orderId,
    uploaded_by: userId,
    file_path: filePath,
    file_name: file.name,
    content_type: file.type
  })
}

export async function getMyProfile(userId) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}
