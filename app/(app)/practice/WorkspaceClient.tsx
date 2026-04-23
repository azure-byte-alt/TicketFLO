'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario } from '@/types'

const priorityColors: Record<string, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Low: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
}

const categoryColors: Record<string, string> = {
  'Authentication / Access': 'bg-purple-100 text-purple-700',
  Hardware: 'bg-gray-100 text-gray-700',
  'Software / Apps': 'bg-blue-100 text-blue-700',
  'Network / VPN': 'bg-cyan-100 text-cyan-700',
  Security: 'bg-red-100 text-red-700',
  Performance: 'bg-orange-100 text-orange-700',
}

const coachTips = [
  { type: 'tip', icon: '💡', text: 'A strong ticket title includes WHO is affected + WHAT is wrong. Example: "VP Cannot Access Outlook — Post Windows Update"' },
  { type: 'tip', icon: '💡', text: 'Always document troubleshooting steps even if none were taken. Write: "No steps taken prior to ticket submission."' },
  { type: 'warning', icon: '⚠️', text: 'Missing business impact is a common QA failure. State whether work is blocked or just inconvenient.' },
  { type: 'tip', icon: '💡', text: 'Include the caller\'s name, department, and contact number in every ticket.' },
  { type: 'strength', icon: '✅', text: 'Pro tip: Set priority based on business impact, not just how upset the caller is.' },
]

function getPriority(scenario: Scenario): string {
  const p = scenario.correct_priority?.toLowerCase() || ''
  if (p.includes('critical')) return 'Critical'
  if (p.includes('high')) return 'High'
  if (p.includes('low')) return 'Low'
  return 'Medium'
}

export default function WorkspaceClient({ scenarios }: { scenarios: Scenario[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Scenario | null>(scenarios[0] ?? null)
  const [step, setStep] = useState<'probe' | 'write'>('probe')
  const [checkedProbes, setCheckedProbes] = useState<number[]>([])
  const [ticket, setTicket] = useState({ title: '', priority: '', category: '', description: '', steps: '', impact: '' })

  const toggleProbe = (i: number) => {
    setCheckedProbes(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const selectScenario = (s: Scenario) => {
    setSelected(s)
    setStep('probe')
    setCheckedProbes([])
    setTicket({ title: '', priority: '', category: '', description: '', steps: '', impact: '' })
  }

  const probeQuestions = selected ? [
    `What exactly is ${selected.caller_name || 'the user'} experiencing?`,
    'When did the issue first start?',
    'Has anything changed recently — updates, new software, password changes?',
    'How many users are affected?',
    'What error message appears, if any?',
    'What troubleshooting has already been attempted?',
    'What is the business impact — is work completely blocked?',
  ] : []

  const qaChecklist = [
    { label: 'Clear, specific title', done: ticket.title.length > 15 },
    { label: 'Priority assigned', done: ticket.priority !== '' },
    { label: 'Category assigned', done: ticket.category !== '' },
    { label: 'Issue fully described', done: ticket.description.length > 60 },
    { label: 'Troubleshooting steps listed', done: ticket.steps.length > 20 },
    { label: 'Business impact noted', done: ticket.impact.length > 10 },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a2744]">Practice Workspace</h1>
            <p className="text-sm text-gray-500 mt-0.5">Select a ticket from the queue, probe the situation, then write your ticket</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-[#4db8a4] rounded-full animate-pulse"></span>
            AI Coach Active
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Ticket Queue */}
        <div className="w-72 border-r border-gray-100 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-[#1a2744]">📋 Ticket Queue</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{scenarios.length} open</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {scenarios.map((s) => {
              const p = getPriority(s)
              const pc = priorityColors[p]
              const isActive = selected?.id === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => selectScenario(s)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-all ${
                    isActive ? 'bg-[#f0fdfa] border-l-2 border-l-[#4db8a4]' : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-1 ${isActive ? 'text-[#0f172a]' : 'text-[#334155]'}`}>
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{s.category}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
                    {p}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CENTER — Workspace */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-5 flex flex-col gap-4">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">👈</div>
                <p className="font-medium">Select a ticket from the queue to start</p>
              </div>
            </div>
          ) : (
            <>
              {/* Scenario Header */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${categoryColors[selected.category] ?? 'bg-slate-100 text-slate-700'}`}>
                        {selected.category}
                      </span>
                      <span className="text-xs text-gray-400">#{selected.scenario_number?.toString().padStart(3, '0') ?? '001'}</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1a2744]">{selected.title}</h2>
                    {selected.caller_name && (
                      <p className="text-sm text-gray-500 mt-1">
                        Caller: <strong>{selected.caller_name}</strong>
                        {selected.department && ` · ${selected.department}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/practice/${selected.id}`)}
                    className="text-xs text-gray-400 hover:text-[#4db8a4] border border-gray-200 hover:border-[#4db8a4] px-3 py-1.5 rounded-lg transition"
                  >
                    Full Screen →
                  </button>
                </div>
                <div className="mt-3 p-3 bg-[#f8fafc] rounded-lg border-l-2 border-[#4db8a4]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📞 Situation</p>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {selected.situation_text || selected.description}
                  </p>
                  {selected.error_message && (
                    <p className="text-xs text-red-600 mt-2 font-mono bg-red-50 px-2 py-1 rounded">
                      Error: {selected.error_message}
                    </p>
                  )}
                  {selected.urgency_note && (
                    <p className="text-xs text-orange-600 mt-2 font-semibold">⚡ {selected.urgency_note}</p>
                  )}
                </div>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-3">
                {(['probe', 'write'] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === s ? 'bg-[#4db8a4] text-white' : i < (['probe','write'].indexOf(step)) ? 'bg-[#1a2744] text-white' : 'bg-gray-200 text-gray-400'
                    }`}>{i + 1}</div>
                    <span className={`text-xs font-medium capitalize ${step === s ? 'text-[#1a2744]' : 'text-gray-400'}`}>{s === 'probe' ? 'Probing' : 'Write Ticket'}</span>
                    {i < 1 && <span className="text-gray-300 text-sm">›</span>}
                  </div>
                ))}
              </div>

              {/* STEP 1: PROBING */}
              {step === 'probe' && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-[#1a2744] mb-1">🔍 Step 1: Probing Questions</h3>
                  <p className="text-xs text-gray-500 mb-4">Select all questions you would ask before writing this ticket.</p>
                  <div className="flex flex-col gap-2">
                    {probeQuestions.map((q, i) => (
                      <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                        checkedProbes.includes(i) ? 'border-[#4db8a4] bg-[#f0fdfa] text-[#0f172a]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={checkedProbes.includes(i)}
                          onChange={() => toggleProbe(i)}
                          className="mt-0.5 accent-[#4db8a4]"
                        />
                        {q}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{checkedProbes.length} of {probeQuestions.length} selected</p>
                    <button
                      onClick={() => setStep('write')}
                      className="bg-[#1a2744] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#243456] transition"
                    >
                      Continue to Ticket Writing →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: WRITE TICKET */}
              {step === 'write' && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-[#1a2744] mb-1">✍️ Step 2: Write the Ticket</h3>
                  <p className="text-xs text-gray-500 mb-4">Use your probing answers to write a complete, QA-ready ticket.</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ticket Title *</label>
                      <input
                        value={ticket.title}
                        onChange={e => setTicket({...ticket, title: e.target.value})}
                        placeholder="Who + What — e.g. 'VP Cannot Access Outlook Post-Update'"
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority *</label>
                        <select
                          value={ticket.priority}
                          onChange={e => setTicket({...ticket, priority: e.target.value})}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                        >
                          <option value="">Select priority</option>
                          <option>Critical</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category *</label>
                        <select
                          value={ticket.category}
                          onChange={e => setTicket({...ticket, category: e.target.value})}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] bg-white"
                        >
                          <option value="">Select category</option>
                          <option>Authentication / Access</option>
                          <option>Hardware</option>
                          <option>Software / Apps</option>
                          <option>Network / VPN</option>
                          <option>Security</option>
                          <option>Performance</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Description *</label>
                      <textarea
                        value={ticket.description}
                        onChange={e => setTicket({...ticket, description: e.target.value})}
                        placeholder="Describe the issue clearly. Include what the user reported, when it started, and how many users are affected."
                        rows={3}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Troubleshooting Steps Taken</label>
                      <textarea
                        value={ticket.steps}
                        onChange={e => setTicket({...ticket, steps: e.target.value})}
                        placeholder="List what was tried, in order. If nothing was tried, write: No steps taken prior to submission."
                        rows={2}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Impact</label>
                      <input
                        value={ticket.impact}
                        onChange={e => setTicket({...ticket, impact: e.target.value})}
                        placeholder="Is work completely blocked? Deadline affected? How many users impacted?"
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4db8a4]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => setStep('probe')}
                      className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => router.push(`/practice/${selected.id}`)}
                      className="flex-1 bg-[#4db8a4] hover:bg-[#3da898] text-white py-2 rounded-lg text-sm font-bold transition"
                    >
                      Submit for AI Scoring →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT — AI Coach Panel */}
        <div className="w-72 border-l border-gray-100 bg-white flex flex-col flex-shrink-0 overflow-y-auto">
          {/* Coach Header */}
          <div className="px-4 py-3 bg-[#1a2744] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4db8a4] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">AI</div>
            <div>
              <p className="text-white text-sm font-bold">AI Coach</p>
              <p className="text-[#4db8a4] text-xs">Watching your work</p>
            </div>
          </div>

          {/* Coach Tips */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Coach Tips</p>
            <div className="flex flex-col gap-2">
              {coachTips.slice(0, 3).map((tip, i) => (
                <div key={i} className={`p-3 rounded-lg text-xs leading-relaxed border-l-2 ${
                  tip.type === 'strength' ? 'bg-green-50 border-green-400 text-green-800' :
                  tip.type === 'warning' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' :
                  'bg-blue-50 border-blue-400 text-blue-800'
                }`}>
                  <span className="mr-1">{tip.icon}</span>{tip.text}
                </div>
              ))}
            </div>
          </div>

          {/* QA Rubric */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">QA Rubric</p>
            <div className="flex flex-col gap-2">
              {qaChecklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${item.done ? 'bg-[#4db8a4]' : 'bg-gray-200'}`}>
                    {item.done ? '✓' : ''}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-[#1a2744] font-medium' : 'text-gray-400'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Info */}
          {selected && (
            <div className="p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Scenario Info</p>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty</span>
                  <span className="font-semibold text-[#1a2744] capitalize">{selected.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category</span>
                  <span className="font-semibold text-[#1a2744]">{selected.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Correct Priority</span>
                  <span className="font-semibold text-[#1a2744]">{selected.correct_priority ?? 'TBD'}</span>
                </div>
                {selected.caller_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Caller</span>
                    <span className="font-semibold text-[#1a2744]">{selected.caller_name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
