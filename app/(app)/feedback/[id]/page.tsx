import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ScoreCard, { getScoreColor } from '@/components/ScoreCard'

function ScoreDimension({ label, score, max = 25 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}/{max}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default async function FeedbackDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const token = getToken()
  if (!token) notFound()
  const userInfo = decodeToken(token)
  if (!userInfo) notFound()

  const { data: feedback } = await supabase
    .from('feedback')
    .select(`
      *,
      tickets (
        id,
        title,
        category,
        priority,
        description,
        steps_to_reproduce,
        scenario_id,
        scenarios (
          id,
          title,
          description,
          difficulty
        )
      )
    `)
    .eq('id', params.id)
    .eq('user_id', userInfo.id)
    .single()

  if (!feedback) notFound()

  const ticket = Array.isArray(feedback.tickets) ? feedback.tickets[0] : feedback.tickets
  const scenario = ticket && (Array.isArray((ticket as any).scenarios) ? (ticket as any).scenarios[0] : (ticket as any).scenarios)
  const scoreColors = getScoreColor(feedback.total_score)

  const gradeLabel =
    feedback.total_score >= 90 ? 'Excellent' :
    feedback.total_score >= 80 ? 'Good' :
    feedback.total_score >= 60 ? 'Needs Improvement' :
    'Poor'

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/feedback" className="text-sm text-[#4db8a4] hover:underline flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feedback History
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2744]">
            {scenario?.title || ticket?.title || 'Ticket Feedback'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Submitted {new Date(feedback.created_at).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
        {scenario?.id && (
          <Link
            href={`/practice/${scenario.id}`}
            className="px-4 py-2 border border-[#1a2744] text-[#1a2744] rounded-lg text-sm font-medium hover:bg-[#1a2744] hover:text-white transition whitespace-nowrap"
          >
            Try Again
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Score Circle */}
        <div className={`rounded-xl p-6 flex flex-col items-center justify-center border ${scoreColors.border} ${scoreColors.bg}`}>
          <ScoreCard score={feedback.total_score} size="lg" />
          <div className={`mt-3 text-sm font-semibold ${scoreColors.text}`}>{gradeLabel}</div>
        </div>

        {/* Dimension Scores */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-5">Score Breakdown</h2>
          <div className="space-y-4">
            <ScoreDimension label="Title Quality" score={feedback.title_score} />
            <ScoreDimension label="Description Quality" score={feedback.description_score} />
            <ScoreDimension label="Steps to Reproduce" score={feedback.steps_score} />
            <ScoreDimension label="Priority & Category" score={feedback.priority_category_score} />
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-[#1a2744] text-white rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-[#4db8a4] mb-2">Overall Feedback</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{feedback.overall_feedback}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-4 flex items-center gap-2">
            <span className="text-green-500">✓</span> Strengths
          </h2>
          {feedback.strengths.length === 0 ? (
            <p className="text-gray-400 text-sm">No specific strengths noted.</p>
          ) : (
            <ul className="space-y-3">
              {feedback.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-snug">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Improvements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-[#1a2744] mb-4 flex items-center gap-2">
            <span className="text-amber-500">⚠</span> Areas to Improve
          </h2>
          {feedback.improvements.length === 0 ? (
            <p className="text-gray-400 text-sm">No improvements needed — great ticket!</p>
          ) : (
            <ul className="space-y-3">
              {feedback.improvements.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-snug">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Your Ticket */}
      <details className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 group">
        <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl transition">
          <h2 className="font-semibold text-[#1a2744]">Your Submitted Ticket</h2>
          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-6 pb-6 border-t border-gray-50 pt-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Category</span>
              <p className="text-gray-800 mt-1">{ticket?.category}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Priority</span>
              <p className="text-gray-800 mt-1">{ticket?.priority}</p>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Title</span>
            <p className="text-gray-800 mt-1">{ticket?.title}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</span>
            <p className="text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{ticket?.description}</p>
          </div>
          {ticket?.steps_to_reproduce && (
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Steps to Reproduce</span>
              <p className="text-gray-800 mt-1 font-mono text-xs leading-relaxed whitespace-pre-wrap">{ticket.steps_to_reproduce}</p>
            </div>
          )}
        </div>
      </details>

      {/* Ideal Ticket */}
      {(feedback.ideal_title || feedback.ideal_description || feedback.ideal_steps) && (
        <details className="bg-green-50 border border-green-200 rounded-xl group">
          <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-green-100/50 rounded-xl transition">
            <h2 className="font-semibold text-green-800 flex items-center gap-2">
              <span>🎯</span> Ideal Ticket Example
            </h2>
            <svg className="w-5 h-5 text-green-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-6 pb-6 border-t border-green-200 pt-4 space-y-4 text-sm">
            {feedback.ideal_title && (
              <div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Ideal Title</span>
                <p className="text-green-900 mt-1 font-medium">{feedback.ideal_title}</p>
              </div>
            )}
            {feedback.ideal_description && (
              <div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Ideal Description</span>
                <p className="text-green-900 mt-1 leading-relaxed whitespace-pre-wrap">{feedback.ideal_description}</p>
              </div>
            )}
            {feedback.ideal_steps && (
              <div>
                <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Ideal Steps</span>
                <p className="text-green-900 mt-1 font-mono text-xs leading-relaxed whitespace-pre-wrap">{feedback.ideal_steps}</p>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  )
}
