'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'

function getPriority(scenario: Scenario): string {
  const p = scenario.correct_priority?.toLowerCase() || ''
  if (p.includes('critical')) return 'Critical'
  if (p.includes('high')) return 'High'
  if (p.includes('low')) return 'Low'
  return 'Medium'
}

const priorityStyle: Record<string, { color: string; bg: string }> = {
  Critical: { color: '#c0392b', bg: '#fff0f0' },
  High:     { color: '#b45309', bg: '#fffbeb' },
  Medium:   { color: '#b45309', bg: '#fffbeb' },
  Low:      { color: '#0e7c5b', bg: '#f0faf6' },
}

const VISIBLE_TABS = 5

export default function WorkspaceClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [ticket, setTicket] = useState({
    title: '', priority: '', category: '',
    impact: '', description: '', steps: '', resolution: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scenarios.length > 0) selectScenario(scenarios[0])
  }, [])

  function selectScenario(scenario: Scenario) {
    setSelected(scenario)
    setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })
    setError(null)
  }

  async function handleSubmit() {
    if (!selected) return
    if (!ticket.title.trim() || !ticket.priority || !ticket.category || ticket.description.length < 20) {
      setError('Please fill in Title, Priority, Category, and a full Description before submitting.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selected.id,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          description: ticket.description,
          steps: ticket.steps,
          scenarioContext: selected.situation_text || (selected as any).description || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      router.push(`/feedback/${data.feedbackId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const canSubmit = ticket.title.length > 0 && ticket.priority !== '' && ticket.category !== '' && ticket.description.length > 20

  const qaChecklist = [
    { label: 'Ticket title written',  done: ticket.title.length > 10 },
    { label: 'Priority selected',     done: ticket.priority !== '' },
    { label: 'Category selected',     done: ticket.category !== '' },
    { label: 'User impact noted',     done: ticket.impact !== '' },
    { label: 'Description complete',  done: ticket.description.length > 60 },
    { label: 'Steps taken recorded',  done: ticket.steps.length > 10 },
    { label: 'Resolution noted',      done: ticket.resolution.length > 5 },
  ]
  const qaScore = qaChecklist.filter(q => q.done).length
  const qaPercent = Math.round((qaScore / qaChecklist.length) * 100)

  const priority = selected ? getPriority(selected) : 'Medium'
  const pStyle = priorityStyle[priority]
  const visibleScenarios = scenarios.slice(0, VISIBLE_TABS)
  const hiddenCount = Math.max(0, scenarios.length - VISIBLE_TABS)

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 flex items-end px-4 overflow-x-auto flex-shrink-0">
        {visibleScenarios.map((s) => {
          const isActive = selected?.id === s.id
          const shortTitle = s.title.length > 22 ? s.title.slice(0, 22) + '…' : s.title
          return (
            <button
              key={s.id}
              onClick={() => selectScenario(s)}
              className={`px-4 py-2.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-all duration-150 flex-shrink-0 ${
                isActive
                  ? 'text-emerald-700 border-emerald-600 font-semibold'
                  : 'text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200'
              }`}
            >
              {shortTitle}
            </button>
          )
        })}
        {hiddenCount > 0 && (
          <span className="px-4 py-2.5 text-[12px] text-gray-300 flex-shrink-0">+{hiddenCount} more</span>
        )}
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[13px] text-gray-400">Select a scenario above to get started</p>
          </div>
        ) : (
          <div className="grid gap-3 p-5" style={{ gridTemplateColumns: '1fr 192px' }}>

            {/* Left column */}
            <div className="flex flex-col gap-3">

              {/* Scenario card */}
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                        Scenario {selected.scenario_number?.toString().padStart(3, '0') ?? '001'} · {selected.category}
                      </div>
                      <h2 className="text-[15px] font-bold text-gray-900 leading-snug">{selected.title}</h2>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {selected.caller_name && <span className="font-medium text-gray-600">{selected.caller_name}</span>}
                        {selected.department && <span> · {selected.department}</span>}
                        {selected.scenario_number && <span> · Ext: {1000 + selected.scenario_number}</span>}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: pStyle.color, background: pStyle.bg }}>
                      {priority}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <div className="border-l-4 border-emerald-500 pl-4 bg-gray-50 py-3 rounded-r-lg mb-3" style={{ borderRadius: '0 8px 8px 0' }}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Caller says</p>
                    <p className="text-[13px] text-gray-700 leading-relaxed">
                      {selected.situation_text || (selected as any).description}
                    </p>
                    {selected.error_message && (
                      <p className="text-[11px] text-red-600 mt-2 font-mono bg-red-50 px-2 py-1 rounded">
                        Error: {selected.error_message}
                      </p>
                    )}
                    {selected.urgency_note && (
                      <p className="text-[11px] text-amber-700 mt-2 font-semibold bg-amber-50 px-2 py-1 rounded">
                        ⚡ {selected.urgency_note}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Caller',     val: selected.caller_name || '—' },
                      { label: 'Department', val: selected.department || '—' },
                      { label: 'Impact',     val: 'Cannot work' },
                      { label: 'Category',   val: selected.category || '—' },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                        <div className="text-[11px] font-medium text-gray-700 truncate">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ticket form */}
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Write the Ticket</div>
                  <span className="text-[11px] text-gray-400">* required</span>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Subject / Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={ticket.title}
                      onChange={e => setTicket({ ...ticket, title: e.target.value })}
                      placeholder="Brief, clear description of the issue..."
                      maxLength={120}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                    <div className="text-[10px] text-gray-400 text-right mt-0.5">{ticket.title.length}/120</div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Priority <span className="text-red-400">*</span>
                    </label>
                    <select value={ticket.priority} onChange={e => setTicket({ ...ticket, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition">
                      <option value="">— Select Priority —</option>
                      <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select value={ticket.category} onChange={e => setTicket({ ...ticket, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition">
                      <option value="">— Select Category —</option>
                      <option>Hardware</option><option>Software / Apps</option>
                      <option>Network / Connectivity</option><option>Account / Password</option>
                      <option>Email</option><option>Printer</option>
                      <option>Authentication / Access</option><option>Network / VPN</option>
                      <option>Security</option><option>Performance</option><option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">User Impact</label>
                    <select value={ticket.impact} onChange={e => setTicket({ ...ticket, impact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition">
                      <option value="">— Select Impact —</option>
                      <option>User unable to work</option><option>User can partially work</option>
                      <option>Minor inconvenience</option><option>Multiple users affected</option>
                      <option>No immediate impact</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Steps Already Taken</label>
                    <input value={ticket.steps} onChange={e => setTicket({ ...ticket, steps: e.target.value })}
                      placeholder="e.g. Restarted PC, checked cables..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Full Description <span className="text-red-400">*</span>
                    </label>
                    <textarea value={ticket.description} onChange={e => setTicket({ ...ticket, description: e.target.value })}
                      placeholder="Describe the issue in detail. Include: what happened, when it started, what was already tried, and any error messages..."
                      rows={4} maxLength={2000}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition" />
                    <div className="text-[10px] text-gray-400 text-right mt-0.5">{ticket.description.length}/2000</div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">Resolution / Next Action</label>
                    <input value={ticket.resolution} onChange={e => setTicket({ ...ticket, resolution: e.target.value })}
                      placeholder="e.g. Dispatched tech, escalated to Tier 2, resolved remotely..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })}
                    className="px-4 py-2 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    Clear
                  </button>
                  <button onClick={() => { const next = scenarios.find(s => s.id !== selected?.id); if (next) selectScenario(next) }}
                    className="px-4 py-2 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    Next Scenario →
                  </button>
                  <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}
                    className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                      canSubmit && !isSubmitting
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Evaluating with AI...
                      </>
                    ) : canSubmit ? 'Submit for AI Coaching →' : 'Complete required fields to submit'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">QA Checklist</div>
                <div className="text-[12px] font-semibold text-emerald-700 mb-2">{qaScore}/{qaChecklist.length} complete</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${qaPercent}%` }} />
                </div>
                <div className="space-y-2">
                  {qaChecklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${item.done ? 'bg-emerald-600' : 'border border-gray-200'}`}>
                        {item.done && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-[11px] transition-all ${item.done ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mb-2">Tip</div>
                <p className="text-[11px] text-amber-800 leading-relaxed">A strong title includes WHO is affected + WHAT the issue is.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="text-[9px] font-bold text-blue-700 uppercase tracking-wider mb-2">Remember</div>
                <p className="text-[11px] text-blue-800 leading-relaxed">Priority is based on business impact — not how upset the caller sounds.</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Scoring</div>
                {[['Title Quality','25'],['Description','25'],['Steps Taken','25'],['Priority / Category','25']].map(([label, pts]) => (
                  <div key={label} className="flex justify-between text-[11px] py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-400">{pts} pts</span>
                  </div>
                ))}
                <div className="flex justify-between text-[12px] font-bold pt-2 text-gray-700 mt-1">
                  <span>Total</span><span>100 pts</span>
                </div>
              </div>

              {qaScore >= 5 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-[11px] text-emerald-800 font-semibold leading-relaxed">Looking strong! Submit for AI coaching when ready.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
