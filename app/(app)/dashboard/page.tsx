import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'

const TIPS = [
  'Always include the affected system or application name in the ticket title.',
  'Specify when the issue started — exact time and date helps IT prioritize.',
  'Number your reproduction steps for clarity and consistency.',
  'Include error messages verbatim — exact text helps find solutions faster.',
  'State the business impact: is work blocked, or is it a minor inconvenience?',
  'Mention how many users are affected — one person or the whole department?',
  'Note any recent changes: updates, new software, configuration changes.',
  'Attach screenshots or logs when possible — a picture is worth a thousand words.',
]

function getTipOfTheDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return TIPS[dayOfYear % TIPS.length]
}

function getScoreStyle(score: number): { color: string; bg: string } {
  if (score >= 80) return { color: '#0e7c5b', bg: '#f0faf6' }
  if (score >= 60) return { color: '#b45309', bg: '#fffbeb' }
  return { color: '#c0392b', bg: '#fff0f0' }
}

export default async function DashboardPage() {
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const supabase = createClient()

  // User profile
  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', userInfo.id)
    .single()

  // Step 1 — get this user's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, title')
    .eq('user_id', userInfo.id)

  const submissionIds = submissions?.map((s) => s.id) ?? []
  const titleMap = Object.fromEntries((submissions ?? []).map((s) => [s.id, s.title]))

  // Step 2 — get feedback for those submissions
  const { data: allFeedback } = submissionIds.length > 0
    ? await supabase
        .from('feedback')
        .select('score, created_at, submission_id')
        .in('submission_id', submissionIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const totalTickets = allFeedback?.length ?? 0

  const avgScore = totalTickets > 0
    ? Math.round(allFeedback!.reduce((sum, f) => sum + f.score, 0) / totalTickets)
    : 0

  const bestScore = totalTickets > 0
    ? Math.max(...allFeedback!.map((f) => f.score))
    : 0

  let streak = 0
  if (allFeedback && allFeedback.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates = Array.from(new Set(allFeedback.map((f) => new Date(f.created_at).toDateString())))
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let currentDate = today
    for (const dateStr of dates) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      const diff = Math.round((currentDate.getTime() - date.getTime()) / 86400000)
      if (diff === 0 || diff === 1) { streak++; currentDate = date } else { break }
    }
  }

  const CERT_TARGET = 10
  const certProgress = Math.min(Math.round((totalTickets / CERT_TARGET) * 100), 100)
  const ticketsToUnlock = Math.max(CERT_TARGET - totalTickets, 0)
  const recentSubmissions = (allFeedback ?? []).slice(0, 3)
  const firstName = profile?.first_name ?? userInfo.fullName?.split(' ')[0] ?? 'there'
  const tip = getTipOfTheDay()
  const avgStyle = getScoreStyle(avgScore)

  return (
    <div className="p-7 min-h-full">

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Welcome back, {firstName} 👋</h1>
          <p className="text-[13px] text-gray-500 mt-1">Every strong ticket builds career confidence.</p>
        </div>
        <Link href="/practice" className="bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap no-underline">
          + Start Practice
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-4">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Certification Progress</span>
          <span className="text-[13px] font-bold text-emerald-700">{certProgress}% Complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 rounded-full transition-all duration-700" style={{ width: `${certProgress}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          {ticketsToUnlock > 0 ? `Complete ${ticketsToUnlock} more ticket${ticketsToUnlock !== 1 ? 's' : ''} to unlock your certificate` : "You've unlocked your certificate! 🎉"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-gray-50">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="#0e7c5b" strokeWidth="1.5"/><path d="M5 7h6M5 10h4" stroke="#0e7c5b" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <div className="text-2xl font-bold tracking-tight text-gray-900">{totalTickets}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Tickets</div>
          <div className="text-xs text-gray-500 mt-1.5">{totalTickets === 0 ? 'Write your first ticket today' : `Start ticket #${totalTickets + 1} today`}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: avgStyle.bg }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke={avgStyle.color} strokeWidth="1.3"/></svg>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: avgStyle.color }}>{avgScore}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Average Score</div>
          <div className="text-xs mt-1.5" style={{ color: avgStyle.color }}>{avgScore >= 80 ? 'Excellent work!' : avgScore >= 60 ? 'Good — keep pushing' : "Below 60 — let's fix that"}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-amber-50">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="#b45309" strokeWidth="1.3"/></svg>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: getScoreStyle(bestScore).color }}>{bestScore}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Best Score</div>
          <div className="text-xs text-gray-500 mt-1.5">{bestScore >= 80 ? 'Outstanding!' : bestScore >= 60 ? 'Push past 80 next time' : 'Push past 60 next time'}</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-gray-50">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M9 2C7 4 6 6 8 8c-1 0-2.5-.5-3-2C4.5 8 4 9.5 4 11c0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2-5-3-9z" stroke="#9ea8b8" strokeWidth="1.3" strokeLinejoin="round"/></svg>
          </div>
          <div className="text-2xl font-bold tracking-tight text-gray-400">{streak === 0 ? '—' : streak}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Day Streak</div>
          <div className="text-xs text-gray-500 mt-1.5">{streak === 0 ? 'Start your streak today' : `${streak} Day Momentum Streak 🔥`}</div>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Submissions</div>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-400">No submissions yet.</p>
              <Link href="/practice" className="text-[13px] text-emerald-700 font-medium hover:underline mt-1 block no-underline">Write your first ticket →</Link>
            </div>
          ) : (
            recentSubmissions.map((item, i) => {
              const style = getScoreStyle(item.score)
              const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const title = titleMap[item.submission_id] ?? `Practice Ticket #${i + 1}`
              return (
                <div key={i} className={`flex items-center justify-between py-3 ${i < recentSubmissions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div>
                    <div className="text-[13px] font-medium text-gray-700">{title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: style.color, background: style.bg }}>{item.score}/100</span>
                    <Link href="/feedback" className="text-[12px] text-gray-300 hover:text-gray-500 transition-colors no-underline">View →</Link>
                  </div>
                </div>
              )
            })
          )}
          <div className="mt-3">
            <Link href="/feedback" className="text-[12px] text-emerald-700 font-medium hover:underline no-underline">View all feedback →</Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">Tip of the Day</div>
            <p className="text-[12px] text-emerald-900 leading-relaxed">{tip}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex-1">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Growth Center</div>
            {[
              { label: 'New Practice Session',      href: '/practice',    color: '#0e7c5b', bg: '#f0faf6' },
              { label: 'Continue Last Scenario',    href: '/practice',    color: '#6b7a8f', bg: '#f4f5f7' },
              { label: 'Improve Weak Area',         href: '/feedback',    color: '#b45309', bg: '#fffbeb' },
              { label: 'View Certificate Progress', href: '/certificate', color: '#6b7a8f', bg: '#f4f5f7' },
            ].map((item, i, arr) => (
              <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 py-2 group no-underline ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                </div>
                <span className="text-[12px] text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{item.label}</span>
                <span className="text-gray-300 ml-auto text-sm group-hover:text-gray-500 transition-colors">›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
