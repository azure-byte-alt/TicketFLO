import { createClient, getToken } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const token = getToken()
  if (!token) redirect('/login')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
