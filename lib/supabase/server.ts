import { createClient as supabaseCreateClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function getToken(): string | null {
  return cookies().get('sb-access-token')?.value ?? null
}

export function decodeToken(token: string): { id: string; email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
    if (!payload.sub) return null
    return { id: payload.sub as string, email: (payload.email ?? '') as string }
  } catch {
    return null
  }
}

export function createClient() {
  const token = getToken()
  return supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    }
  )
}
