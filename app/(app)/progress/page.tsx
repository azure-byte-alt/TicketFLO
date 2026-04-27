import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'
import { ScoreBadge } from '@/components/ScoreCard'
import { getDifficultyFromTier } from '@/lib/scenarios'

const ACHIEVEMENTS = [
  { id: 'first_ticket',  icon: '🎫', title: 'First Ticket',           desc: 'Submit your first practice ticket',  condition: (n: number) => n >= 1 },
  { id: 'five_tickets',  icon: '🎯', title: 'Getting Started',         desc: 'Submit 5 practice tickets',          condition: (n: number) => n >= 5 },
  { id: 'ten_tickets',   icon: '📋', title: 'Consistent Practitioner', desc: 'Submit 10 practice tickets',         condition: (n: number) => n >= 10 },
  { id: 'score_70',      icon: '⭐', title: 'Solid Effort',            desc: 'Score 70 or higher on a ticket',     condition: (_n: number, best: number) => best >= 70 },
  { id: 'score_85',      icon: '🏆', title: 'Sharp Analyst',           desc: 'Score 85 or higher on a ticket',     condition: (_n: number, best: number) => best >= 85 },
  { id: 'score_95',      icon: '💪', title: 'Ticket Master',           desc: 'Score 95 or higher on a ticket',     condition: (_n: number, best: number) => best >= 95 },
  { id: 'perfect_100',   icon: '🌟', title: 'Flawless',                desc: 'Score a perfect 100',                condition: (_n: number, best: number) => best === 100 },
]

function getScoreStyle(score: number): { color: string; bg: string } {
  if (score >= 80) return { color: '#0e7c5b', bg: '#f0faf6' }
  if (score >= 60) return { color: '#b45309', bg: '#fffbeb' }
  return { color: '#c0392b', bg: '#fff0f0' }
}

function getBarColor(pct: number): string {
  if (pct >= 80) return '#0e7c5b'
  if (pct >= 60) return '#b45309'
  return '#e24b4a'
}

export default async function ProgressPage() {
  const supabase = createClient()
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  // Step 1 — get this user's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, category, scenario_id')
    .eq('user_id', userInfo.id)

  const submissionIds = submissions?.map((s) => s.id) ?? []
  const submissionMap = Object.fromEntries((submissions ?? []).map((s) => [s.id, s]))

  // Step 2 — get feedback for those submissions
  const { data: allFeedback } = submissionIds.length > 0
    ? await supabase
        .from('feedback')
        .select('id, score, score_label, strength, improvement, critical_miss, created_at, submission_id')
        .in('submission_id', submissionIds)
        .order('created_at', { ascending: true })
    : { data: [] }

  const total = allFeedback?.length ?? 0
  const avgScore = total > 0
    ? Math.round(allFeedback!.reduce((s, f) => s + f.score, 0) / total)
    : 0
  const bestScore = total > 0 ? Math.max(...allFeedback!.map((f) => f.score)) : 0

  let trend = 0
  if (total >= 2) {
    const recent = allFeedback!.slice(-5)
    const older = allFeedback!.slice(-10, -5)
    if (older.length > 0) {
      const recentAvg = recent.reduce((s, f) => s + f.score, 0) / recent.length
      const olderAvg = older.reduce((s, f) => s + f.score, 0) / older.length
      trend = Math.round(recentAvg - olderAvg)
    }
  }

  const categoryStats: Record<string, { total: number; count: number }> = {}
  allFeedback?.forEach((f) => {
    const cat = submissionMap[f.submission_id]?.category ?? 'Other'
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 }
    categoryStats[cat].total += f.score
    categoryStats[cat].count++
  })

  const scoreBuckets = total > 0 ? {
    title:       Math.round(avgScore * 0.25),
    description: Math.round(avgScore * 0.25),
    steps:       Math.round(avgScore * 0.25),
    priority:    Math.round(avgScore * 0.25),
  } : { title: 0, description: 0, steps: 0, priority: 0 }

  const recent10 = (allFeedback ?? []).slice(-10).reverse()
  const avgStyle  = getScoreStyle(avgScore)
  const bestStyle = getScoreStyle(bestScore)
  const trendColor = trend >= 0 ? '#0e7c5b' : '#c0392b'
  const trendBg    = trend >= 0 ? '#f0faf6'  : '#fff0f0'

  return (
    <div className="p-7">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Your Progress</h1>
        <p className="text-[13px] text-gray-500 mt-1">Track your improvement over time</p>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="font-semibold text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-400 text-sm mb-4">Complete practice sessions to see your progress here.</p>
          <Link href="/practice" className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition no-underline">
            Start Practicing
          </Link>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Sessions',  value: total,                              sub: 'practice tickets',  color: '#0f1623', bg: '#f4f5f7' },
              { label: 'Average Score',   value: `${avgScore}/100`,                  sub: 'across all tickets', color: avgStyle.color,  bg: avgStyle.bg },
              { label: 'Best Score',      value: `${bestScore}/100`,                 sub: 'personal best',      color: bestStyle.color, bg: bestStyle.bg },
              { label: 'Trend',           value: trend >= 0 ? `+${trend}` : `${trend}`, sub: 'vs. previous 5', color: trendColor,       bg: trendBg },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                <div className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">{s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Skill Scores + Category */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Average Skill Scores</div>
              <div className="space-y-4">
                {[
                  { label: 'Title Quality',        score: scoreBuckets.title },
                  { label: 'Description Quality',  score: scoreBuckets.description },
                  { label: 'Probing & Details',    score: scoreBuckets.steps },
                  { label: 'Priority & Category',  score: scoreBuckets.priority },
                ].map(({ label, score }) => {
                  const pct = Math.round((score / 25) * 100)
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span className="text-gray-700 font-medium">{label}</span>
                        <span className="text-gray-400">{score}/25</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: getBarColor(pct) }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Performance by Category</div>
              {Object.keys(categoryStats).length === 0 ? (
                <p className="text-gray-400 text-sm">No category data yet.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryStats).map(([cat, { total: t, count }]) => {
                    const avg = Math.round(t / count)
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-[13px] mb-1.5">
                          <span className="text-gray-700 font-medium">{cat}</span>
                          <span className="text-gray-400">{avg}/100 ({count} session{count !== 1 ? 's' : ''})</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${avg}%`, background: getBarColor(avg) }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Score History */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Score History</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['#', 'Date', 'Score', 'Title', 'Desc', 'Steps', 'Priority'].map((h) => (
                      <th key={h} className={`pb-3 font-semibold text-gray-400 text-[11px] uppercase tracking-wider ${h === '#' || h === 'Date' ? 'text-left' : 'text-center'} ${['Title','Desc','Steps','Priority'].includes(h) ? 'hidden sm:table-cell' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent10.map((f, i) => (
                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-[13px] text-gray-400">#{total - i}</td>
                      <td className="py-3 text-[13px] text-gray-600">
                        {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-center">
                        <ScoreBadge score={f.score} />
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell text-[13px] text-gray-500">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-[13px] text-gray-500">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-[13px] text-gray-500">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-[13px] text-gray-500">{Math.round(f.score * 0.25)}/25</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">Achievements</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = ach.condition(total, bestScore)
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-4 text-center border transition-all duration-200 ${
                      unlocked
                        ? 'bg-emerald-50 border-emerald-200 hover:shadow-md'
                        : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-2xl mb-2">{ach.icon}</div>
                    <div className={`font-semibold text-[13px] ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {ach.title}
                    </div>
                    <div className={`text-[11px] mt-1 leading-snug ${unlocked ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {ach.desc}
                    </div>
                    {unlocked && (
                      <div className="mt-2 text-[11px] text-emerald-700 font-semibold">Unlocked ✓</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
