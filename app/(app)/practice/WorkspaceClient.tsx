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

function playRingTone() {
  try {
    const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)()
    const playBeep = (time: number) => {
      [0, 0.25].forEach(offset => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(480, ctx.currentTime + time + offset)
        gain.gain.setValueAtTime(0.15, ctx.currentTime + time + offset)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + offset + 0.22)
        osc.start(ctx.currentTime + time + offset)
        osc.stop(ctx.currentTime + time + offset + 0.22)
      })
    }
    playBeep(0); playBeep(0.8); playBeep(1.6)
  } catch (e) {}
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-700' },
  High: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Low: { bg: 'bg-green-100', text: 'text-green-700' },
}

export default function WorkspaceClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'ringing' | 'active'>('idle')
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [ticket, setTicket] = useState({
    title: '',
    priority: '',
    category: '',
    impact: '',
    description: '',
    steps: '',
    resolution: '',
  })

  useEffect(() => {
    if (scenarios.length > 0) {
      triggerCall(scenarios[0])
    }
  }, [])

  useEffect(() => {
    if (phase !== 'ringing') return
    playRingTone()
    const interval = setInterval(playRingTone, 3000)
    return () => clearInterval(interval)
  }, [phase])

  function triggerCall(scenario: Scenario) {
    setSelected(scenario)
    setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })
    setPhase('ringing')
  }

  function answerCall() {
    setPhase('active')
  }

  function declineCall() {
    setPhase('idle')
    setSelected(null)
  }

  function handleSubmit() {
    if (selected) router.push(`/practice/${selected.id}`)
  }

  const canSubmit = ticket.title.length > 0 && ticket.priority !== '' && ticket.category !== '' && ticket.description.length > 20

  const qaChecklist = [
    { label: 'Ticket title written', done: ticket.title.length > 10 },
    { label: 'Priority selected', done: ticket.priority !== '' },
    { label: 'Category selected', done: ticket.category !== '' },
    { label: 'User impact noted', done: ticket.impact !== '' },
    { label: 'Description complete', done: ticket.description.length > 60 },
    { label: 'Steps taken recorded', done: ticket.steps.length > 10 },
    { label: 'Resolution noted', done: ticket.resolution.length > 5 },
  ]
  const qaScore = qaChecklist.filter(q => q.done).length

  return (
    <div className="flex h-full bg-[#f8fafc]">

      {/* LEFT — Scenario Queue */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold text-[#1a2744]">Ticket Queue</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
            {scenarios.length} open
          </span>
        </div>
        <div className="overflow-y-auto flex-1">
          {scenarios.map((s) => {
            const p = getPriority(s)
            const pc = priorityColors[p]
            const isActive = selected?.id === s.id
            return (
              <div
                key={s.id}
                onClick={() => triggerCall(s)}
                className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#f0fdfa] border-l-2 border-l-[#4db8a4]'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">📞</span>
                  <p className={`text-xs font-semibold leading-snug ${isActive ? 'text-[#0f172a]' : 'text-[#334155]'}`}>
                    {s.title}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mb-1.5">{s.category}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                  {p}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* CENTER — Main workspace */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* PHONE RINGING OVERLAY */}
        {phase === 'ringing' && selected && (
          <div className="absolute inset-0 bg-[#0f1923]/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 text-center">
              <div className="relative inline-flex items-center justify-center mb-5">
                <div className="absolute w-20 h-20 bg-[#4db8a4]/20 rounded-full animate-ping" />
                <div className="absolute w-16 h-16 bg-[#4db8a4]/30 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                <div className="relative w-14 h-14 bg-[#1a2744] rounded-full flex items-center justify-center text-2xl">
                  📞
                </div>
              </div>
              <p className="text-xs font-semibold text-[#4db8a4] uppercase tracking-widest mb-1">Incoming Call</p>
              <h2 className="text-xl font-bold text-[#1a2744] mb-0.5">{selected.caller_name || 'Unknown Caller'}</h2>
              <p className="text-sm text-gray-500 mb-0.5">{selected.department || 'Unknown Department'}</p>
              {selected.scenario_number && (
                <p className="text-xs text-gray-400 mb-6">Ext: {1000 + selected.scenario_number} · Building A</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={declineCall}
                  className="flex-1 py-3 rounded-xl bg-red-100 text-red-600 font-semibold text-sm hover:bg-red-200 transition"
                >
                  📵 Decline
                </button>
                <button
                  onClick={answerCall}
                  className="flex-1 py-3 rounded-xl bg-[#1a2744] text-white font-semibold text-sm hover:bg-[#243456] transition"
                >
                  ✅ Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IDLE STATE */}
        {phase === 'idle' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-4">📞</div>
              <p className="font-medium">Select a ticket from the queue to receive the call</p>
            </div>
          </div>
        )}

        {/* ACTIVE — Scenario + Ticket Form */}
        {phase === 'active' && selected && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

            {/* Scenario card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#1a2744] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#4db8a4] text-xs font-bold uppercase tracking-widest mb-1">
                      📞 Incoming Call — Scenario #{selected.scenario_number?.toString().padStart(3, '0') ?? '001'}
                    </p>
                    <h2 className="text-white text-lg font-bold">{selected.title}</h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {selected.caller_name && <span className="font-medium text-gray-300">{selected.caller_name}</span>}
                      {selected.department && <span> · {selected.department}</span>}
                      {selected.scenario_number && <span> · Ext: {1000 + selected.scenario_number}</span>}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${priorityColors[getPriority(selected)].bg} ${priorityColors[getPriority(selected)].text}`}>
                    {selected.category}
                  </span>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="border-l-4 border-[#4db8a4] pl-4 bg-[#f8fafc] py-3 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Caller says:</p>
                  <p className="text-sm text-[#334155] leading-relaxed">{selected.situation_text || selected.description}</p>
                  {selected.error_message && (
                    <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 px-2 py-1 rounded">Error: {selected.error_message}</p>
                  )}
                  {selected.urgency_note && (
                    <p className="text-xs text-orange-600 mt-2 font-semibold">⚡ {selected.urgency_note}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ticket Form */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1a2744]">✍️ Write the Ticket</h3>
                <span className="text-xs text-gray-400">* Required fields</span>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Subject / Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={ticket.title}
                    onChange={e => setTicket({ ...ticket, title: e.target.value })}
                    placeholder="Brief, clear description of the issue..."
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Priority <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={e => setTicket({ ...ticket, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                  >
                    <option value="">-- Select Priority --</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={ticket.category}
                    onChange={e => setTicket({ ...ticket, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                  >
                    <option value="">-- Select Category --</option>
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
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User Impact</label>
                  <select
                    value={ticket.impact}
                    onChange={e => setTicket({ ...ticket, impact: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                  >
                    <option value="">-- Select Impact --</option>
                    <option>User unable to work</option>
                    <option>User can partially work</option>
                    <option>Minor inconvenience</option>
                    <option>Multiple users affected</option>
                    <option>No immediate impact</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Steps Already Taken</label>
                  <input
                    value={ticket.steps}
                    onChange={e => setTicket({ ...ticket, steps: e.target.value })}
                    placeholder="e.g. Restarted PC, checked cables..."
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Full Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={ticket.description}
                    onChange={e => setTicket({ ...ticket, description: e.target.value })}
                    placeholder="Describe the issue in detail. Include: what happened, when it started, what was already tried, and any error messages..."
                    rows={4}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resolution / Next Action</label>
                  <input
                    value={ticket.resolution}
                    onChange={e => setTicket({ ...ticket, resolution: e.target.value })}
                    placeholder="e.g. Dispatched tech, escalated to Tier 2, resolved remotely..."
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setTicket({ title: '', priority: '', category: '', impact: '', description: '', steps: '', resolution: '' })}
                  className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={() => triggerCall(scenarios[Math.floor(Math.random() * scenarios.length)])}
                  className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Next Scenario →
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${
                    canSubmit
                      ? 'bg-[#1a2744] hover:bg-[#243456] text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ✓ Submit Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — QA Checklist */}
      <div className="w-56 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 bg-[#1a2744] flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#4db8a4] flex items-center justify-center text-white text-xs font-bold">QA</div>
          <div>
            <p className="text-white text-xs font-bold">QA Checklist</p>
            <p className="text-[#4db8a4] text-xs">{qaScore}/{qaChecklist.length} complete</p>
          </div>
        </div>
        <div className="p-4 flex-1">
          <div className="flex flex-col gap-2.5">
            {qaChecklist.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs transition-all ${item.done ? 'bg-[#4db8a4]' : 'bg-gray-200'}`}>
                  {item.done ? '✓' : ''}
                </div>
                <span className={`text-xs transition-all ${item.done ? 'text-[#1a2744] font-medium' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#4db8a4] rounded-full transition-all duration-500" style={{ width: `${(qaScore / qaChecklist.length) * 100}%` }} />
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quick Tips</p>
            <div className="p-3 bg-blue-50 border-l-2 border-blue-400 rounded-r-lg text-xs text-blue-800 leading-relaxed">
              💡 A strong title includes WHO is affected + WHAT the issue is.
            </div>
            <div className="p-3 bg-amber-50 border-l-2 border-amber-400 rounded-r-lg text-xs text-amber-800 leading-relaxed">
              ! Priority is based on business impact — not how upset the caller sounds.
            </div>
            {qaScore >= 5 && (
              <div className="p-3 bg-green-50 border-l-2 border-green-400 rounded-r-lg text-xs text-green-800 leading-relaxed">
                ✓ Looking strong! Submit when ready.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
