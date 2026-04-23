import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = getToken()
  if (!token) redirect('/login')

  const decoded = decodeToken(token)
  if (!decoded) redirect('/login')

  const supabase = createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', decoded.id)
    .single()

  const fullName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : null

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      <Sidebar
        userName={fullName}
        userEmail={decoded.email ?? null}
      />
      <main className="ml-64 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
