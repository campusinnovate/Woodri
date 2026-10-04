import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const projectUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const allowedOrigins = (Deno.env.get('WOODRI_ALLOWED_ORIGINS') || 'https://campusinnovate.github.io,http://localhost:8000')
  .split(',').map((origin) => origin.trim())

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  const cors = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })

  try {
    if (!origin || !allowedOrigins.includes(origin)) {
      return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: cors })
    }
    const authorization = req.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return Response.json({ error: 'Admin sign-in required' }, { status: 401, headers: cors })
    }
    const userClient = createClient(projectUrl, anonKey, { global: { headers: { Authorization: authorization } } })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) return Response.json({ error: 'Invalid session' }, { status: 401, headers: cors })

    const service = createClient(projectUrl, serviceKey, { auth: { persistSession: false } })
    const { data: membership } = await service.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!membership) return Response.json({ error: 'Admin access required' }, { status: 403, headers: cors })

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Email tidak valid' }, { status: 400, headers: cors })
    }
    if (password.length < 12) {
      return Response.json({ error: 'Kata sandi awal minimal 12 karakter' }, { status: 400, headers: cors })
    }
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createError || !created.user) {
      return Response.json({ error: createError?.message || 'Akun tidak berhasil dibuat' }, { status: 400, headers: cors })
    }
    const { error: grantError } = await service.from('admin_users').insert({ user_id: created.user.id })
    if (grantError) {
      await service.auth.admin.deleteUser(created.user.id)
      return Response.json({ error: 'Akun dibuat tetapi hak admin gagal disimpan; akun dibatalkan.' }, { status: 500, headers: cors })
    }
    return Response.json({ email }, { status: 201, headers: cors })
  } catch (error) {
    console.error('create-admin-user failed', error)
    return Response.json({ error: 'Terjadi kesalahan saat membuat akun admin' }, { status: 500, headers: cors })
  }
})
