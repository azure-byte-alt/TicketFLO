import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PracticeForm from './PracticeForm'

export default async function PracticeSessionPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: scenario } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!scenario) notFound()

  const token = getToken()
  if (!token) notFound()
  const userInfo = decodeToken(token)
  if (!userInfo) notFound()

  return <PracticeForm scenario={scenario} userId={userInfo.id} />
}
