import { NextResponse } from 'next/server'
import { createClient, getToken } from '@/lib/supabase/server'

export async function GET() {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? '',
  })
}
