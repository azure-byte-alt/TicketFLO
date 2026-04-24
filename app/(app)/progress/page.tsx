import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'
import { ScoreBadge } from '@/components/ScoreCard'
import { getDifficultyFromTier } from '@/lib/scenarios'

const ACHIEVEMENTS = [
  { id: 'first_ticket', icon: '🎫', title: 'First Ticket', desc: 'Submit your first practice ticket', condition: (n: number) => n >= 1 },
  { id: 'five_tickets', icon: '🎯', title: 'Getting Started', desc: 'Submit 5 practice tickets', condition: (n: number) => n >= 5 },
  { id: 'ten_tickets', icon: '📋', title: 'Consistent Practitioner', desc: 'Submit 10 practice tickets', condition: (n: number) => n >= 10 },
  { id: 'score_70', icon: '⭐', title: 'Solid Effort', desc: 'Score 70 or higher on a ticket', condition: (_n: number, best: number) => best >= 70 },
  { id: 'score_85', icon: '🏆', title: 'Sharp Analyst', desc: 'Score 85 or higher on a ticket', condition: (_n: number, best: number) => best >= 85 },
  { id: 'score_95', icon: '💪', title: 'Ticket Master', desc: 'Score 95 or higher on a ticket', condition: (_n: number, best: number) => best >= 95 },
  { id: 'perfect_100', icon: '🌟', title: 'Flawless', desc: 'Score a perfect 100', condition: (_n: number, best: number) => best === 100 },
]


export default async function ProgressPage() {
  const supabase = createClient()
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const { data: allFeedback } = await supabase
    .from('feedback')
    .select(`
      id,
      score,
      score_label,
      strength,
      improvement,
      critical_miss,
      created_at,
      submissions!inner (
        category,
        scenarios (
          tier
        )
      )
    `)
    .eq('submissions.user_id', userInfo.id)
    .order('created_at', { ascending: true })

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
    const submission = Array.isArray(f.submissions) ? f.submissions[0] : f.submissions
    const cat = (submission as any)?.category ?? 'Other'
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, count: 0 }
    categoryStats[cat].total += f.score
    categoryStats[cat].count++
  })

  const diffStats: Record<string, { total: number; count: number }> = {}
  allFeedback?.forEach((f) => {
    const submission = Array.isArray(f.submissions) ? f.submissions[0] : f.submissions
    const scenario = submission && (Array.isArray((submission as any).scenarios) ? (submission as any).scenarios[0] : (submission as any).scenarios)
    const diff = getDifficultyFromTier(scenario?.tier)
    if (!diffStats[diff]) diffStats[diff] = { total: 0, count: 0 }
    diffStats[diff].total += f.score
    diffStats[diff].count++
  })

  const scoreBuckets = total > 0 ? {
    title: Math.round(avgScore * 0.25),
    description: Math.round(avgScore * 0.25),
    steps: Math.round(avgScore * 0.25),
    priority: Math.round(avgScore * 0.25),
  } : { title: 0, description: 0, steps: 0, priority: 0 }

  const recent10 = (allFeedback ?? []).slice(-10).reverse()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a2744]">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your improvement over time</p>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">ðŸ“ˆ</div>
          <h3 className="font-semibold text-[#1a2744] mb-2">No data yet</h3>
          <p className="text-gray-500 text-sm mb-4">Complete practice sessions to see your progress here.</p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Sessions', value: total, sub: 'practice tickets', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Average Score', value: `${avgScore}/100`, sub: 'across all tickets', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Best Score', value: `${bestScore}/100`, sub: 'personal best', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Trend', value: trend >= 0 ? `+${trend}` : `${trend}`, sub: 'vs. previous 5', color: trend >= 0 ? 'text-green-600' : 'text-red-500', bg: trend >= 0 ? 'bg-green-50' : 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="font-medium text-[#1a2744] text-sm mt-1">{s.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1a2744] mb-5">Average Skill Scores</h2>
              <div className="space-y-4">
                {[
                  { label: 'Title Quality', score: scoreBuckets.title },
                  { label: 'Description Quality', score: scoreBuckets.description },
                  { label: 'Steps to Reproduce', score: scoreBuckets.steps },
                  { label: 'Priority & Category', score: scoreBuckets.priority },
                ].map(({ label, score }) => {
                  const pct = Math.round((score / 25) * 100)
                  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-700 font-medium">{label}</span>
                        <span className="text-gray-500">{score}/25</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-[#1a2744] mb-5">Performance by Category</h2>
              {Object.keys(categoryStats).length === 0 ? (
                <p className="text-gray-400 text-sm">No category data yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryStats).map(([cat, { total: t, count }]) => {
                    const avg = Math.round(t / count)
                    const pct = avg
                    const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{cat}</span>
                          <span className="text-gray-500">{avg}/100 ({count} session{count !== 1 ? 's' : ''})</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-[#1a2744] mb-5">Recent Score History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 font-semibold text-gray-500">#</th>
                    <th className="text-left pb-3 font-semibold text-gray-500">Date</th>
                    <th className="text-center pb-3 font-semibold text-gray-500">Score</th>
                    <th className="text-center pb-3 font-semibold text-gray-500 hidden sm:table-cell">Title</th>
                    <th className="text-center pb-3 font-semibold text-gray-500 hidden sm:table-cell">Desc</th>
                    <th className="text-center pb-3 font-semibold text-gray-500 hidden sm:table-cell">Steps</th>
                    <th className="text-center pb-3 font-semibold text-gray-500 hidden sm:table-cell">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent10.map((f, i) => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-400">#{total - i}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-center">
                        <ScoreBadge score={f.score} />
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-600">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-600">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-600">{Math.round(f.score * 0.25)}/25</td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-600">{Math.round(f.score * 0.25)}/25</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1a2744] mb-5">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = ach.condition(total, bestScore)
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-4 text-center border transition ${
                      unlocked
                        ? 'bg-[#1a2744] border-[#4db8a4] shadow-md'
                        : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <div className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                      {ach.title}
                    </div>
                    <div className={`text-xs mt-1 ${unlocked ? 'text-[#4db8a4]' : 'text-gray-400'}`}>
                      {ach.desc}
                    </div>
                    {unlocked && (
                      <div className="mt-2 text-xs text-[#4db8a4] font-semibold">Unlocked ✓</div>
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
