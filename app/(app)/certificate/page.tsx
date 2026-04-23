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

  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userInfo.id)
    .single()

  const { data: feedback } = await supabase
    .from('feedback')
    .select(`score, submissions!inner(user_id)`)
    .eq('submissions.user_id', userInfo.id)

  const totalTickets = feedback?.length ?? 0
  const avgScore = totalTickets > 0
    ? Math.round(feedback!.reduce((sum, f) => sum + f.score, 0) / totalTickets)
    : 0

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : userInfo.email?.split('@')[0] || 'Learner'

  const issuedDate = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const certCode = cert?.certificate_code ?? 'TF-BETA-2026'
  const certScore = cert?.final_avg_score ?? avgScore
  const scoreLabel = certScore >= 80 ? 'Distinction' : certScore >= 65 ? 'Proficient' : 'Foundational'
  const scoreBadgeColor = certScore >= 80 ? '#16a34a' : certScore >= 65 ? '#4db8a4' : '#f59e0b'

  if (totalTickets < 3) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-[#1a2744] mb-2">Almost There!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Complete at least <strong>3 practice tickets</strong> to earn your TicketFLO certificate.
            You've completed <strong>{totalTickets}</strong> so far.
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
            Continue Practicing →
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
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div
        id="certificate"
        className="bg-white rounded-2xl shadow-lg border-2 border-[#1a2744] max-w-3xl mx-auto overflow-hidden print:shadow-none"
      >
        {/* Top Banner */}
        <div className="bg-[#1a2744] px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4db8a4]/20 rounded-lg flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#4db8a4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="#4db8a4" strokeWidth="2"/>
                <path d="M9 12h6M9 16h4" stroke="#4db8a4" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">TicketFLO</p>
              <p className="text-[#4db8a4] text-xs font-semibold tracking-widest uppercase">Training</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Certificate Code</p>
            <p className="text-white text-sm font-mono font-bold">{certCode}</p>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="px-10 py-10 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-2">Certificate of Completion</p>
          <p className="text-gray-500 text-sm mb-6">This certifies that</p>

          <h2 className="text-4xl font-bold text-[#1a2744] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {fullName}
          </h2>

          <p className="text-gray-500 text-sm mb-8">
            has successfully completed the
          </p>

          <div className="bg-[#f0fdfa] border border-[#4db8a4]/30 rounded-xl px-8 py-4 mb-8 inline-block">
            <p className="text-[#1a2744] font-bold text-xl">IT Help Desk Ticket Writing</p>
            <p className="text-[#4db8a4] font-semibold text-sm mt-1">Foundational Training Program</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1a2744]">{certScore}</div>
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

          {cert?.strongest_skill && (
            <div className="flex items-center justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[#4db8a4]">✓</span>
                <span className="text-gray-600">Strongest: <strong>{cert.strongest_skill}</strong></span>
              </div>
              {cert.most_improved_skill && (
                <div className="flex items-center gap-2">
                  <span className="text-[#4db8a4]">↑</span>
                  <span className="text-gray-600">Most Improved: <strong>{cert.most_improved_skill}</strong></span>
                </div>
              )}
            </div>
          )}

          <p className="text-gray-400 text-sm">Issued on {issuedDate}</p>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#f8fafc] border-t border-gray-100 px-10 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">ticketflotraining.com</p>
          <p className="text-xs text-gray-400">@2026 TicketFLO Training. All rights reserved.</p>
        </div>
      </div>

      {/* Share Section */}
      <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1a2744]">Share your achievement</p>
          <p className="text-xs text-gray-400 mt-0.5">Let your network know you completed TicketFLO training</p>
        </div>
        
          href={`https://www.linkedin.com/sharing/share-offsite/?url=ticketflotraining.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#0077b5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#006396] transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Share on LinkedIn
        </a>
      </div>
    </div>
  )
}
