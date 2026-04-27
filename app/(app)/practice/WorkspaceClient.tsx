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

export default function WorkspaceClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [ticket, setTicket] = useState({
    title: '', priority: '', category: '',
    impact: '', description: '', steps: '', resolution: '',
  })

  useEffect(() => {
    if (scenarios.length > 0) selectScenario(scenarios[0])
  }, [])

  function selectScenario(scenario: Scenario) {
    setSelected(scenario)
    setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })
  }

  function handleSubmit() {
    if (selected) router.push(`/practice/${selected.id}`)
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

  return (
    <div className="flex h-full bg-gray-50 font-sans">

      {/* ── Left queue ───────────────────────────────────── */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[12px] font-bold text-gray-900">Ticket Queue</span>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">
            {scenarios.length} open
          </span>
        </div>
        <div className="overflow-y-auto flex-1">
          {scenarios.map((s) => {
            const p = getPriority(s)
            const ps = priorityStyle[p]
            const isActive = selected?.id === s.id
            return (
              <div
                key={s.id}
                onClick={() => selectScenario(s)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all border-l-2 ${
                  isActive ? 'bg-emerald-50 border-l-emerald-600' : 'border-l-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{marginTop:2,flexShrink:0}}>
                    <path d="M14 10.67v2a1.33 1.33 0 01-1.45 1.33 13.18 13.18 0 01-5.75-2.05 13 13 0 01-4-4 13.18 13.18 0 01-2.05-5.78A1.33 1.33 0 012.07 1h2a1.33 1.33 0 011.33 1.15c.08.6.23 1.19.43 1.76a1.33 1.33 0 01-.3 1.4L4.79 6.06a10.67 10.67 0 004 4l.75-.75a1.33 1.33 0 011.4-.3c.57.2 1.16.35 1.76.43A1.33 1.33 0 0114 10.67z" stroke={isActive ? '#0e7c5b' : '#9ea8b8'} strokeWidth="1.3"/>
                  </svg>
                  <p className={`text-[12px] font-medium leading-snug ${isActive ? 'text-emerald-800' : 'text-gray-700'}`}>
                    {s.title}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400 mb-1.5 ml-5">{s.category}</p>
                <span className="ml-5 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: ps.color, background: ps.bg }}>
                  {p}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Center ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg width="40" height="40" viewBox="0 0 16 16" fill="none" style={{margin:'0 auto 12px'}}>
                <path d="M14 10.67v2a1.33 1.33 0 01-1.45 1.33 13.18 13.18 0 01-5.75-2.05 13 13 0 01-4-4 13.18 13.18 0 01-2.05-5.78A1.33 1.33 0 012.07 1h2a1.33 1.33 0 011.33 1.15c.08.6.23 1.19.43 1.76a1.33 1.33 0 01-.3 1.4L4.79 6.06a10.67 10.67 0 004 4l.75-.75a1.33 1.33 0 011.4-.3c.57.2 1.16.35 1.76.43A1.33 1.33 0 0114 10.67z" stroke="#d1d5db" strokeWidth="1.3"/>
              </svg>
              <p className="text-[13px]">Select a scenario from the queue to get started</p>
            </div>
          </div>
        ) : (
          <>
            {/* Scenario card */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      Scenario #{selected.scenario_number?.toString().padStart(3, '0') ?? '001'} · {selected.category}
                    </div>
                    <h2 className="text-[16px] font-bold text-gray-900 leading-snug">{selected.title}</h2>
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
                <div className="border-l-4 border-emerald-500 pl-4 bg-gray-50 py-3 rounded-r-lg" style={{borderRadius:'0 8px 8px 0'}}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Caller says</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{selected.situation_text || (selected as any).description}</p>
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

                {/* Caller detail chips */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Caller', val: selected.caller_name || '—' },
                    { label: 'Department', val: selected.department || '—' },
                    { label: 'Priority hint', val: priority },
                    { label: 'Category', val: selected.category || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
                      <div className="text-[12px] font-medium text-gray-700 truncate">{val}</div>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Subject / Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={ticket.title}
                    onChange={e => setTicket({ ...ticket, title: e.target.value })}
                    placeholder="Brief, clear description of the issue..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Priority <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={e => setTicket({ ...ticket, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                  >
                    <option value="">— Select Priority —</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ticket.category}
                    onChange={e => setTicket({ ...ticket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                  >
                    <option value="">— Select Category —</option>
                    <option>Hardware</option>
                    <option>Software / Apps</option>
                    <option>Network / Connectivity</option>
                    <option>Account / Password</option>
                    <option>Email</option>
                    <option>Printer</option>
                    <option>Authentication / Access</option>
                    <option>Network / VPN</option>
                    <option>Security</option>
                    <option>Performance</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    User Impact
                  </label>
                  <select
                    value={ticket.impact}
                    onChange={e => setTicket({ ...ticket, impact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition"
                  >
                    <option value="">— Select Impact —</option>
                    <option>User unable to work</option>
                    <option>User can partially work</option>
                    <option>Minor inconvenience</option>
                    <option>Multiple users affected</option>
                    <option>No immediate impact</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Steps Already Taken
                  </label>
                  <input
                    value={ticket.steps}
                    onChange={e => setTicket({ ...ticket, steps: e.target.value })}
                    placeholder="e.g. Restarted PC, checked cables..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Full Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={ticket.description}
                    onChange={e => setTicket({ ...ticket, description: e.target.value })}
                    placeholder="Describe the issue in detail. Include: what happened, when it started, what was already tried, and any error messages..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                    Resolution / Next Action
                  </label>
                  <input
                    value={ticket.resolution}
                    onChange={e => setTicket({ ...ticket, resolution: e.target.value })}
                    placeholder="e.g. Dispatched tech, escalated to Tier 2, resolved remotely..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })}
                  className="px-4 py-2 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => selectScenario(scenarios[Math.floor(Math.random() * scenarios.length)])}
                  className="px-4 py-2 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Next Scenario →
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                    canSubmit
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canSubmit ? 'Submit for AI Coaching →' : 'Complete required fields to submit'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right — QA Checklist ──────────────────────────── */}
      <div className="w-52 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <span style={{fontSize:10,fontWeight:700,color:'#0e7c5b'}}>QA</span>
            </div>
            <span className="text-[12px] font-bold text-gray-900">QA Checklist</span>
          </div>
          <div className="text-[11px] text-gray-400">{qaScore}/{qaChecklist.length} complete</div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${qaPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2.5 mb-5">
            {qaChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${item.done ? 'bg-emerald-600' : 'border border-gray-200 bg-white'}`}>
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

          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Quick Tips</p>
            <div className="bg-blue-50 border-l-2 border-blue-400 pl-3 pr-2 py-2 rounded-r-lg" style={{borderRadius:'0 6px 6px 0'}}>
              <p className="text-[11px] text-blue-800 leading-relaxed">A strong title includes WHO is affected + WHAT the issue is.</p>
            </div>
            <div className="bg-amber-50 border-l-2 border-amber-400 pl-3 pr-2 py-2 rounded-r-lg" style={{borderRadius:'0 6px 6px 0'}}>
              <p className="text-[11px] text-amber-800 leading-relaxed">Priority is based on business impact — not how upset the caller sounds.</p>
            </div>
            {qaScore >= 5 && (
              <div className="bg-emerald-50 border-l-2 border-emerald-500 pl-3 pr-2 py-2 rounded-r-lg" style={{borderRadius:'0 6px 6px 0'}}>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">Looking strong! Submit for AI coaching when ready.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
