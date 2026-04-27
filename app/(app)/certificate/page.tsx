import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CertificatePage() {
  const token = getToken()
  if (!token) redirect('/login')
  const userInfo = decodeToken(token)
  if (!userInfo) redirect('/login')

  const supabase = createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', userInfo.id)
    .single()

  // Two-step query
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('user_id', userInfo.id)

  const submissionIds = submissions?.map((s) => s.id) ?? []

  const { data: feedbackData } = submissionIds.length > 0
    ? await supabase
        .from('feedback')
        .select('score')
        .in('submission_id', submissionIds)
    : { data: [] }

  const totalTickets = feedbackData?.length ?? 0
  const avgScore = totalTickets > 0
    ? Math.round((feedbackData as any[]).reduce((sum, f) => sum + f.score, 0) / totalTickets)
    : 0

  // Use decoded token name as fallback
  const firstName = profile?.first_name ?? userInfo.fullName?.split(' ')[0] ?? null
  const lastName = profile?.last_name ?? userInfo.fullName?.split(' ').slice(1).join(' ') ?? null
  const fullName = firstName ? `${firstName} ${lastName || ''}`.trim() : userInfo.fullName ?? 'Learner'

  // Performance level based on avg score
  const performanceLevel =
    avgScore >= 80 ? 'Advanced Practitioner' :
    avgScore >= 65 ? 'Proficient Practitioner' :
    'Certified Practitioner'

  // Not enough tickets yet
  if (totalTickets < 3) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Almost There!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Complete at least <strong>3 practice tickets</strong> to earn your certificate.
            You have completed <strong>{totalTickets}</strong> so far.
          </p>
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{totalTickets} completed</span>
              <span>3 required</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((totalTickets / 3) * 100, 100)}%` }}
              />
            </div>
          </div>
          <Link
            href="/practice"
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 no-underline"
          >
            Continue Practicing →
          </Link>
        </div>
      </div>
    )
  }

  // Certificate unlocked
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Your Certificate</h1>
        <p className="text-[13px] text-gray-500 mt-1">Share your achievement</p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-emerald-100 max-w-3xl mx-auto overflow-hidden shadow-sm">

        {/* Header */}
        <div className="bg-emerald-700 px-10 py-6">
          <p className="text-white font-bold text-lg tracking-tight">TicketFLO Training</p>
          <p className="text-emerald-200 text-sm mt-0.5">IT Help Desk Professional Development</p>
        </div>

        {/* Body */}
        <div className="px-10 py-10 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-4">
            Certificate of Completion
          </p>
          <p className="text-gray-500 text-sm mb-4">This certifies that</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{fullName}</h2>
          <p className="text-gray-500 text-sm mb-2">has successfully completed the</p>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-8 py-5 mb-3 inline-block">
            <p className="text-gray-900 font-bold text-xl">TicketFLO Process</p>
            <p className="text-emerald-700 font-semibold text-sm mt-1">
              Handling Support Issues & Writing Quality Help Desk Tickets
            </p>
          </div>

          <p className="text-gray-400 text-xs mb-8">
            Including: Listen · Probe · Troubleshoot · Document · Resolve / Escalate · Improve
          </p>

          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <div className="text-3xl font-bold text-gray-900">{avgScore}</div>
              <div className="text-xs text-gray-400 mt-1">Average Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">{performanceLevel}</div>
              <div className="text-xs text-gray-400 mt-1">Performance Level</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{totalTickets}</div>
              <div className="text-xs text-gray-400 mt-1">Tickets Completed</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-10 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">ticketflotraining.com</p>
          <p className="text-xs text-gray-400">© 2026 TicketFLO Training</p>
        </div>
      </div>
    </div>
  )
}
