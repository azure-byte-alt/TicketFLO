import { createClient, getToken } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = getToken()
  if (!token) redirect('/login')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      <Sidebar
        userName={profile?.full_name ?? null}
        userEmail={user.email ?? null}
      />
      <main className="ml-64 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
