import { createClient, getToken, decodeToken } from '@/lib/supabase/server'
import Link from 'next/link'

function getScoreStyle(score: number): { color: string; bg: string; border: string } {
  if (score >= 80) return { color: '#0e7c5b', bg: '#f0faf6', border: '#c7ead9' }
  if (score >= 60) return { color: '#b45309', bg: '#fffbeb', border: '#fcd34d' }
  return { color: '#c0392b', bg: '#fff0f0', border: '#fca5a5' }
}

export default async function FeedbackPage() {
  const token = getToken()
  if (!token) return null
  const userInfo = decodeToken(token)
  if (!userInfo) return null

  const supabase = createClient()

  // Step 1 — get this user's submissions (RLS filters automatically)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, subject_line')
    .eq('user_id', userInfo.id)

  const submissionIds = submissions?.map((s) => s.id) ?? []
  const titleMap = Object.fromEntries(
    (submissions ?? []).map((s) => [s.id, s.subject_line])
  )

  // Step 2 — get feedback for those submissions
  const { data: feedbackList } = submissionIds.length > 0
    ? await supabase
        .from('feedback')
        .select('id, score, score_label, strength, improvement, critical_miss, coach_note, created_at, submission_id')
        .in('submission_id', submissionIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="p-7 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Feedback</h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {feedbackList?.length ?? 0} ticket{feedbackList?.length !== 1 ? 's' : ''} reviewed
          </p>
        </div>
        <Link
          href="/practice"
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 no-underline whitespace-nowrap"
        >
          + New Practice
        </Link>
      </div>

      {/* Empty state */}
      {(!feedbackList || feedbackList.length === 0) && (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
          <p className="text-gray-400 text-sm mb-3">No feedback yet.</p>
          <Link href="/practice" className="text-emerald-700 text-sm font-medium hover:underline no-underline">
            Write your first ticket to get started →
          </Link>
        </div>
      )}

      {/* Feedback cards */}
      <div className="space-y-4">
        {feedbackList?.map((item) => {
          const style = getScoreStyle(item.score)
          const date = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          })
          const title = titleMap[item.submission_id] ?? 'Practice Ticket'

          return (
            <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">

              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <div className="text-[14px] font-semibold text-gray-800">{title}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: style.color, background: style.bg, border: `1px solid ${style.border}` }}
                  >
                    {item.score_label}
                  </span>
                  <span className="text-[22px] font-bold tracking-tight" style={{ color: style.color }}>
                    {item.score}
                    <span className="text-[13px] font-normal text-gray-400">/100</span>
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="px-5 pt-3 pb-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.score}%`, background: style.color }} />
                </div>
              </div>

              {/* Feedback sections */}
              <div className="px-5 py-4 space-y-4">
                {item.strength && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#0e7c5b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Strength</div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{item.strength}</p>
                    </div>
                  </div>
                )}
                {item.improvement && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v4M6 8v1" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Improve</div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{item.improvement}</p>
                    </div>
                  </div>
                )}
                {item.critical_miss && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Critical miss</div>
                      <p className="text-[13px] text-gray-600 leading-relaxed">{item.critical_miss}</p>
                    </div>
                  </div>
                )}
                {item.coach_note && (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coach note</div>
                    <p className="text-[13px] text-gray-600 leading-relaxed italic">{item.coach_note}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
