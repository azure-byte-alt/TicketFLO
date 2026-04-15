import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'
import { ScoreBadge } from '@/components/ScoreCard'

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

export default async function DashboardPage() {
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userInfo.id)
    .single()

  const { data: allFeedback } = await supabase
    .from('feedback')
    .select('total_score, created_at')
    .eq('user_id', userInfo.id)
    .order('created_at', { ascending: true })

  const totalTickets = allFeedback?.length ?? 0
  const avgScore = totalTickets > 0
    ? Math.round(allFeedback!.reduce((sum, f) => sum + f.total_score, 0) / totalTickets)
    : 0
  const bestScore = totalTickets > 0
    ? Math.max(...allFeedback!.map((f) => f.total_score))
    : 0

  let streak = 0
  if (allFeedback && allFeedback.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dates = Array.from(new Set(allFeedback.map(f => new Date(f.created_at).toDateString())))
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    let currentDate = today
    for (const dateStr of dates) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      const diff = Math.round((currentDate.getTime() - date.getTime()) / 86400000)
      if (diff === 0 || diff === 1) {
        streak++
        currentDate = date
      } else {
        break
      }
    }
  }

  const { data: recentFeedback } = await supabase
    .from('feedback')
    .select(`
      id,
      total_score,
      created_at,
      tickets (
        id,
        title,
        scenarios (
          title
        )
      )
    `)
    .eq('user_id', userInfo.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const displayName = profile?.full_name || userInfo.email?.split('@')[0] || 'there'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const tip = getTipOfTheDay()

  const stats = [
    { label: 'Total Tickets', value: totalTickets, icon: '🎫', color: 'bg-blue-50 text-blue-700' },
    { label: 'Average Score', value: avgScore ? `${avgScore}/100` : 'N/A', icon: '⭐', color: 'bg-purple-50 text-purple-700' },
    { label: 'Best Score', value: bestScore ? `${bestScore}/100` : 'N/A', icon: '🏆', color: 'bg-amber-50 text-amber-700' },
    { label: 'Current Streak', value: `${streak} day${streak !== 1 ? 's' : ''}`, icon: '🔥', color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Welcome back, {displayName}!</h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/learn"
            className="px-4 py-2 border border-[#1a2744] text-[#1a2744] rounded-lg text-sm font-medium hover:bg-[#1a2744] hover:text-white transition"
          >
            Review Learning
          </Link>
          <Link
            href="/practice"
            className="px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
          >
            Start Practice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-[#1a2744]">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-[#1a2744]">Recent Submissions</h2>
          </div>
          {!recentFeedback || recentFeedback.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-500 text-sm">No submissions yet.</p>
              <Link href="/practice" className="text-[#4db8a4] text-sm font-medium hover:underline mt-1 inline-block">
                Start your first practice session
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentFeedback.map((item) => {
                const ticket = Array.isArray(item.tickets) ? item.tickets[0] : item.tickets
                const scenario = ticket && (Array.isArray((ticket as any).scenarios) ? (ticket as any).scenarios[0] : (ticket as any).scenarios)
                return (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1a2744] truncate">
                        {scenario?.title || ticket?.title || 'Untitled Ticket'}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <ScoreBadge score={item.total_score} />
                      <Link
                        href={`/feedback/${item.id}`}
                        className="text-xs text-[#4db8a4] font-medium hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {recentFeedback && recentFeedback.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50">
              <Link href="/feedback" className="text-sm text-[#4db8a4] font-medium hover:underline">
                View all feedback →
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#1a2744] rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="font-semibold text-[#4db8a4]">Tip of the Day</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-[#1a2744] mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/practice" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f4f8] transition group">
                <div className="w-8 h-8 bg-[#4db8a4]/10 rounded-lg flex items-center justify-center group-hover:bg-[#4db8a4]/20">
                  <svg className="w-4 h-4 text-[#4db8a4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a2744]">New Practice Session</span>
              </Link>
              <Link href="/learn" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f4f8] transition group">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a2744]">Learning Modules</span>
              </Link>
              <Link href="/progress" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f0f4f8] transition group">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1a2744]">View Progress</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
