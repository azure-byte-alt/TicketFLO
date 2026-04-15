import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'
import { ScoreBadge } from '@/components/ScoreCard'

export default async function FeedbackPage() {
  const supabase = createClient()
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const { data: feedbackList } = await supabase
    .from('feedback')
    .select(`
      id,
      total_score,
      created_at,
      tickets (
        id,
        title,
        category,
        priority,
        scenarios (
          title,
          difficulty
        )
      )
    `)
    .eq('user_id', userInfo.id)
    .order('created_at', { ascending: false })

  const difficultyBadge: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Feedback History</h1>
          <p className="text-gray-500 mt-1">Review AI feedback on all your submitted tickets</p>
        </div>
        <Link
          href="/practice"
          className="px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
        >
          New Practice
        </Link>
      </div>

      {!feedbackList || feedbackList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="font-semibold text-[#1a2744] mb-2">No feedback yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Complete a practice scenario to receive AI-powered feedback on your ticket writing.
          </p>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4db8a4] text-white rounded-lg text-sm font-medium hover:bg-[#3da898] transition"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Scenario / Ticket</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden lg:table-cell">Difficulty</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-600">Score</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feedbackList.map((item) => {
                const ticket = Array.isArray(item.tickets) ? item.tickets[0] : item.tickets
                const scenario = ticket && (Array.isArray((ticket as any).scenarios) ? (ticket as any).scenarios[0] : (ticket as any).scenarios)
                const difficulty = scenario?.difficulty ?? 'beginner'
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1a2744] truncate max-w-xs">
                        {scenario?.title || ticket?.title || 'Untitled Ticket'}
                      </div>
                      {scenario && ticket?.title && (
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{ticket.title}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-gray-600">{ticket?.category ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          difficultyBadge[difficulty] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={item.total_score} />
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs hidden sm:table-cell whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="text-xs text-[#4db8a4] font-medium hover:underline whitespace-nowrap"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
