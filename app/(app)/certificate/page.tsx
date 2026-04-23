import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CertificatePage() {
  const token = getToken()
  if (!token) redirect('/login')
  const userInfo = decodeToken(token)
  if (!userInfo) redirect('/login')

  const supabase = createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', userInfo.id)
    .single()

  const { data: feedbackData } = await supabase
    .from('feedback')
    .select('score, submissions!inner(user_id)')
    .eq('submissions.user_id', userInfo.id)

  const totalTickets = feedbackData?.length ?? 0
  const avgScore = totalTickets > 0
    ? Math.round(feedbackData!.reduce((sum: number, f: any) => sum + f.score, 0) / totalTickets)
    : 0

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : userInfo.email?.split('@')[0] || 'Learner'

  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const scoreLabel = avgScore >= 80 ? 'Distinction' : avgScore >= 65 ? 'Proficient' : 'Foundational'
  const scoreBadgeColor = avgScore >= 80 ? '#16a34a' : avgScore >= 65 ? '#4db8a4' : '#f59e0b'

  if (totalTickets < 3) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-[#1a2744] mb-2">Almost There!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Complete at least <strong>3 practice tickets</strong> to earn your TicketFLO certificate.
            You have completed <strong>{totalTickets}</strong> so far.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
            <div
              className="bg-[#4db8a4] h-3 rounded-full transition-all"
              style={{ width: `${Math.min((totalTickets / 3) * 100, 100)}%` }}
            />
          </div>
          <Link
            href="/practice"
            className="inline-block bg-[#1a2744] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#243456] transition"
          >
            Continue Practicing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Your Certificate</h1>
          <p className="text-gray-500 text-sm mt-1">Share your achievement with your network</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/practice"
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Keep Practicing
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-[#1a2744] max-w-3xl mx-auto overflow-hidden">
        <div className="bg-[#1a2744] px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-white font-bold text-lg leading-none">TicketFLO</p>
              <p className="text-[#4db8a4] text-xs font-semibold tracking-widest uppercase">Training</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Issued</p>
            <p className="text-white text-sm font-bold">{issuedDate}</p>
          </div>
        </div>

        <div className="px-10 py-10 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-2">Certificate of Completion</p>
          <p className="text-gray-500 text-sm mb-6">This certifies that</p>

          <h2 className="text-4xl font-bold text-[#1a2744] mb-6">
            {fullName}
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            has successfully completed the
          </p>

          <div className="bg-[#f0fdfa] border border-[#4db8a4]/30 rounded-xl px-8 py-4 mb-8 inline-block">
            <p className="text-[#1a2744] font-bold text-xl">IT Help Desk Ticket Writing</p>
            <p className="text-[#4db8a4] font-semibold text-sm mt-1">Foundational Training Program</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2744]">{avgScore}</div>
              <div className="text-xs text-gray-400 mt-1">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: scoreBadgeColor }}>{scoreLabel}</div>
              <div className="text-xs text-gray-400 mt-1">Performance Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2744]">{totalTickets}</div>
              <div className="text-xs text-gray-400 mt-1">Tickets Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-[#f8fafc] border-t border-gray-100 px-10 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">ticketflotraining.com</p>
          <p className="text-xs text-gray-400">@2026 TicketFLO Training</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1a2744]">Share your achievement</p>
          <p className="text-xs text-gray-400 mt-0.5">Let your network know you completed TicketFLO training</p>
        </div>
        
          href="https://www.linkedin.com/sharing/share-offsite/?url=ticketflotraining.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#006396] transition"
        >
          Share on LinkedIn
        </a>
      </div>
    </div>
  )
}
