import { NextRequest, NextResponse } from 'next/server'
import { createClient, getToken } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fullName } = await request.json()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, full_name: fullName?.trim() ?? '' })

  if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
