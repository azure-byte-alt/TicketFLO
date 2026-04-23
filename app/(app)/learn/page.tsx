'use client'

import { useState } from 'react'

const modules = [
  {
    id: 1,
    icon: '🔍',
    title: 'Understanding the issue & recognizing symptoms',
    subtitle: 'The foundation of every strong ticket',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'The difference between an issue and a symptom — and why confusing them leads to bad tickets and wrong routing. This is the most common mistake new agents make.',
      },
      {
        label: 'Issue vs. symptom',
        type: 'comparison',
        left: {
          heading: 'Issue',
          sub: 'What the user cannot do',
          items: ['Cannot print', 'Cannot access email', 'Laptop won\'t start', 'Cannot connect to VPN'],
        },
        right: {
          heading: 'Symptom',
          sub: 'What the user sees or experiences',
          items: ['Printer shows offline', 'Password prompt loops', 'Spinning wheel on boot', 'Error 809 displayed'],
        },
      },
      {
        label: 'Why it matters',
        content: 'A ticket that only describes the symptom gets misrouted. Always document both. The issue tells us what broke — the symptom tells us what the user actually sees. Together they give the next technician everything they need to act.',
      },
      {
        label: 'Real example',
        type: 'example',
        content: 'Issue: User cannot access Outlook\nSymptom: Password prompt repeats every time the user logs in — credentials not being accepted',
      },
    ],
  },
  {
    id: 2,
    icon: '❓',
    title: 'Asking the right questions — probing',
    subtitle: 'Gather everything before you start writing',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'How to gather all the information a ticket needs before you write a single word. Weak tickets almost always trace back to weak probing. Strong agents ask before they type.',
      },
      {
        label: 'The 6-part probing framework',
        type: 'tags',
        items: [
          { tag: 'WHO', desc: 'Is it one user, a team, or a whole department?' },
          { tag: 'WHAT', desc: 'What exactly happened? What error message did they see?' },
          { tag: 'WHEN', desc: 'When did it start? Is it constant or intermittent?' },
          { tag: 'WHERE', desc: 'What device, app, or location is involved?' },
          { tag: 'IMPACT', desc: 'Can the user still work? Is business revenue at risk?' },
          { tag: 'ACTION', desc: 'What steps has the user already tried?' },
        ],
      },
      {
        label: 'Key probing questions every agent should ask',
        type: 'list',
        items: [
          'What exact error message do you see? (Get the exact wording — copy it verbatim)',
          'When did this start? (Date and time narrows down what changed)',
          'Is it only you or are others affected? (Scope determines priority)',
          'What device and operating system are you using?',
          'What changed recently? (Updates, resets, new hardware)',
          'What have you already tried? (Avoids repeating steps)',
          'How urgent is this for your work? (Validates priority level)',
        ],
      },
      {
        label: 'Pro tip',
        type: 'tip',
        content: 'Always ask: "What changed recently?" — a Windows update, a password reset, or new hardware explains the majority of Tier 1 issues. This one question alone closes tickets faster.',
      },
    ],
  },
  {
    id: 3,
    icon: '📝',
    title: 'Writing clear ticket notes',
    subtitle: 'Turn your probing into professional documentation',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'How to combine the issue, symptom, and probing details into clean, professional ticket notes that any technician can read and act on — without calling the user back.',
      },
      {
        label: 'Bad vs. good ticket notes',
        type: 'badgood',
        bad: {
          heading: 'Bad',
          content: '"User said email is broken, looked into it."',
          reason: 'No error details. No time. No device info. No scope. Cannot be actioned.',
        },
        good: {
          heading: 'Good',
          content: '"User unable to access Outlook since 8:00 AM Monday. Password prompt loops on Windows 11 laptop — credentials not accepted. Only this user affected. VPN connected. No recent changes reported."',
          reason: 'Specific. Actionable. The next technician can start working immediately.',
        },
      },
      {
        label: 'Rules for strong notes',
        type: 'list',
        items: [
          'Be factual and objective — describe behavior, not emotions',
          'Avoid blame — write what the system does, not who caused it',
          'Use exact error messages word-for-word (verbatim)',
          'One issue per ticket — do not bundle multiple problems',
          'Write for the next person who reads the ticket, not just yourself',
        ],
      },
      {
        label: 'Avoid these common phrases',
        type: 'avoid',
        items: ['"It doesn\'t work"', '"Something is wrong"', '"User is frustrated"', '"Looked into it"', '"Checked everything"'],
      },
    ],
  },
  {
    id: 4,
    icon: '🔧',
    title: 'Documenting troubleshooting & actions taken',
    subtitle: 'Record every step so no one repeats your work',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'How to document every troubleshooting step taken during a support call — so the next technician never repeats work or has to ask the user the same questions again.',
      },
      {
        label: 'What the actions taken section must include',
        type: 'list',
        items: [
          'Each step you performed — in the order you performed it',
          'The result of each step (did it help, did it fail, no change?)',
          'Any error messages that appeared during troubleshooting',
          'What the final outcome was (resolved, escalated, pending user)',
        ],
      },
      {
        label: 'Example — actions taken section',
        type: 'example',
        content: 'Cleared cached credentials in Windows Credential Manager — issue persisted.\nRestarted Outlook in safe mode — same behavior observed.\nVerified account status in Active Directory — account active, no lockout flags.\nReset user password and tested login — still looping.\nEscalated to Tier 2 for token refresh and deeper Exchange investigation.',
      },
      {
        label: 'Key rule',
        type: 'tip',
        content: 'Never leave the actions taken section blank. A ticket with no documented steps tells the next agent you did nothing — even if you worked on it for 30 minutes. Your work is only real if it\'s written down.',
      },
      {
        label: 'Escalation language',
        type: 'list',
        items: [
          'Use "Escalated to Tier 2" — not "Sent to someone else"',
          'State why you escalated — what you tried and why it didn\'t resolve',
          'Include the escalation ticket number if your system generates one',
        ],
      },
    ],
  },
  {
    id: 5,
    icon: '⚡',
    title: 'Priority, impact & category selection',
    subtitle: 'Getting urgency right is a QA critical skill',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'How to assign the correct priority and category — the two fields most often wrong in QA reviews. Mis-prioritizing tickets is one of the most common help desk problems.',
      },
      {
        label: 'Priority levels',
        type: 'priority',
        items: [
          { level: 'Critical', color: '#E24B4A', bg: '#FCEBEB', desc: 'Business outage — multiple users cannot work, security breach, or data loss. Requires immediate response (15–30 min SLA).', example: 'Company website down, ransomware detected, payroll system unavailable on pay day' },
          { level: 'High', color: '#BA7517', bg: '#FAEEDA', desc: 'Single user completely unable to work with no workaround available. Response within 2–4 hours.', example: 'Manager cannot access email before a board presentation, VPN down for remote worker' },
          { level: 'Medium', color: '#185FA5', bg: '#E6F1FB', desc: 'Work impacted but user can still partially function. A workaround exists. Response within 8 hours.', example: 'Printer offline but user can print from another floor, one feature not working in an app' },
          { level: 'Low', color: '#0F6E56', bg: '#E1F5EE', desc: 'Minor issue, cosmetic problem, or future request. No immediate productivity impact. Response within 24–48 hours.', example: 'Font looks different in a document, software installation request for next month' },
        ],
      },
      {
        label: 'The most common priority mistake',
        type: 'tip',
        content: 'Marking everything "High" to feel safe. Priority inflation clogs the queue and delays genuinely critical issues from getting the attention they need. Use impact — not urgency — to choose priority.',
      },
      {
        label: 'Common ticket categories',
        type: 'tags',
        items: [
          { tag: 'Account / Access', desc: 'Password resets, lockouts, MFA, permissions' },
          { tag: 'Email', desc: 'Outlook, mailbox access, send/receive issues' },
          { tag: 'Hardware', desc: 'Laptop, monitor, peripherals, physical damage' },
          { tag: 'Network / VPN', desc: 'Wi-Fi, VPN, VDI, connectivity, shared drives' },
          { tag: 'Software', desc: 'App crashes, installs, login errors, updates' },
          { tag: 'Security', desc: 'Suspicious activity, BitLocker, escalations' },
        ],
      },
    ],
  },
  {
    id: 6,
    icon: '✅',
    title: 'Completing the ticket professionally',
    subtitle: 'Close it right — what QA actually scores you on',
    sections: [
      {
        label: 'What you\'ll learn',
        content: 'What a complete, professional ticket looks like from open to close — and exactly what QA reviewers are looking for when they score your work.',
      },
      {
        label: 'What a complete ticket contains',
        type: 'ticket',
        fields: [
          { key: 'Issue', value: 'Cannot access Outlook' },
          { key: 'Symptom', value: 'Password prompt repeats on every login — credentials not accepted' },
          { key: 'Probing details', value: 'Started after password reset today. Only this user affected. Windows 11 laptop on company network. No recent hardware changes.' },
          { key: 'Impact', value: 'User cannot send or receive email — fully blocked from work' },
          { key: 'Actions taken', value: 'Removed saved credentials from Credential Manager. Restarted Outlook — issue persisted. Verified account in AD — active, no flags.' },
          { key: 'Priority', value: 'High' },
          { key: 'Category', value: 'Email / Account Access' },
          { key: 'Resolution', value: 'Escalated to Tier 2 — token refresh and Exchange investigation required' },
        ],
      },
      {
        label: 'What QA scores you on',
        type: 'list',
        items: [
          'Ticket title — is it specific and descriptive?',
          'Description quality — does it tell the full story?',
          'Probing — were the right questions asked and documented?',
          'Actions taken — is every troubleshooting step recorded?',
          'Priority accuracy — does it match the real impact?',
          'Professional tone — factual, no blame, no emotional language',
          'Correct closure — resolved with notes or escalated with reason',
        ],
      },
      {
        label: 'You\'re ready to practice',
        type: 'tip',
        content: 'Every module you just completed directly maps to how your tickets are scored in practice. Head to Practice and put it to work.',
      },
    ],
  },
]

function ModuleContent({ section }: { section: any }) {
  if (section.type === 'comparison') {
    return (
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-red-50 rounded-lg p-4">
          <p className="font-medium text-red-800 text-sm mb-1">{section.left.heading}</p>
          <p className="text-red-600 text-xs mb-3">{section.left.sub}</p>
          {section.left.items.map((item: string, i: number) => (
            <p key={i} className="text-sm text-red-700 mb-1">• {item}</p>
          ))}
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="font-medium text-emerald-800 text-sm mb-1">{section.right.heading}</p>
          <p className="text-emerald-600 text-xs mb-3">{section.right.sub}</p>
          {section.right.items.map((item: string, i: number) => (
            <p key={i} className="text-sm text-emerald-700 mb-1">• {item}</p>
          ))}
        </div>
      </div>
    )
  }

  if (section.type === 'tags') {
    return (
      <div className="mt-2 space-y-2">
        {section.items.map((item: any, i: number) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
            <span className="bg-[#1D9E75] text-white text-xs font-semibold px-2 py-1 rounded mt-0.5 whitespace-nowrap min-w-[90px] text-center">
              {item.tag}
            </span>
            <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    )
  }

  if (section.type === 'list') {
    return (
      <ul className="mt-2 space-y-2">
        {section.items.map((item: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-[#1D9E75] mt-0.5 flex-shrink-0">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }

  if (section.type === 'example') {
    return (
      <div className="mt-2 bg-gray-50 border-l-4 border-[#1D9E75] rounded-r-lg p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{section.content}</pre>
      </div>
    )
  }

  if (section.type === 'tip') {
    return (
      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 leading-relaxed">{section.content}</p>
      </div>
    )
  }

  if (section.type === 'badgood') {
    return (
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="bg-red-50 rounded-lg p-4">
          <p className="font-medium text-red-700 text-sm mb-2">✗ {section.bad.heading}</p>
          <p className="text-sm text-red-800 italic mb-2">{section.bad.content}</p>
          <p className="text-xs text-red-600">{section.bad.reason}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="font-medium text-emerald-700 text-sm mb-2">✓ {section.good.heading}</p>
          <p className="text-sm text-emerald-800 italic mb-2">{section.good.content}</p>
          <p className="text-xs text-emerald-600">{section.good.reason}</p>
        </div>
      </div>
    )
  }

  if (section.type === 'avoid') {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {section.items.map((item: string, i: number) => (
          <span key={i} className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-full border border-red-200">
            ✗ {item}
          </span>
        ))}
      </div>
    )
  }

  if (section.type === 'priority') {
    return (
      <div className="mt-2 space-y-3">
        {section.items.map((item: any, i: number) => (
          <div key={i} className="rounded-lg p-4" style={{ backgroundColor: item.bg }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-semibold text-sm" style={{ color: item.color }}>{item.level}</span>
            </div>
            <p className="text-sm text-gray-700 mb-1">{item.desc}</p>
            <p className="text-xs text-gray-500 italic">Example: {item.example}</p>
          </div>
        ))}
      </div>
    )
  }

  if (section.type === 'ticket') {
    return (
      <div className="mt-2 bg-gray-50 rounded-lg p-4 space-y-2">
        {section.fields.map((field: any, i: number) => (
          <div key={i} className="flex gap-3 text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
            <span className="text-[#0F6E56] font-medium min-w-[130px] flex-shrink-0">{field.key}</span>
            <span className="text-gray-700">{field.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return <p className="mt-2 text-sm text-gray-600 leading-relaxed">{section.content}</p>
}

export default function LearnPage() {
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const mod = modules[current]

  function goNext() {
    if (!completed.includes(current)) {
      setCompleted([...completed, current])
    }
    if (current < modules.length - 1) {
      setCurrent(current + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function goPrev() {
    if (current > 0) {
      setCurrent(current - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function jumpTo(index: number) {
    if (index === 0 || completed.includes(index - 1) || completed.includes(index)) {
      setCurrent(index)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const allDone = completed.length === modules.length

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Learn</h1>
        <p className="text-gray-500 text-sm mt-1">
          6 modules · Agent-focused ticket writing training
        </p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-1 mb-8">
        {modules.map((m, i) => {
          const isDone = completed.includes(i)
          const isActive = i === current
          const isAccessible = i === 0 || completed.includes(i - 1) || completed.includes(i)
          return (
            <div key={i} className="flex items-center flex-1">
              <button
                onClick={() => jumpTo(i)}
                disabled={!isAccessible}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all
                  ${isDone
                    ? 'bg-[#1D9E75] text-white'
                    : isActive
                    ? 'bg-[#1A2E3B] text-white'
                    : isAccessible
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isDone ? '✓' : i + 1}
              </button>
              {i < modules.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${isDone ? 'bg-[#1D9E75]' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Module card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">

        {/* Module header */}
        <div className="bg-[#1A2E3B] px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{mod.icon}</span>
            <div>
              <p className="text-[#1D9E75] text-xs font-medium tracking-wide uppercase">
                Module {mod.id} of {modules.length}
              </p>
              <h2 className="text-white text-lg font-semibold leading-snug">{mod.title}</h2>
            </div>
          </div>
          <p className="text-gray-400 text-sm ml-11">{mod.subtitle}</p>
        </div>

        {/* Module body */}
        <div className="px-6 py-5 space-y-6">
          {mod.sections.map((section, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-[#0F6E56] uppercase tracking-wide mb-1">
                {section.label}
              </p>
              <ModuleContent section={section} />
            </div>
          ))}
        </div>

        {/* Navigation footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${current === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-300 text-gray-600 hover:bg-white'
              }`}
          >
            ← Previous
          </button>

          <span className="text-xs text-gray-400">
            {completed.length} of {modules.length} completed
          </span>

          {current < modules.length - 1 ? (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-all"
            >
              Next module →
            </button>
          ) : (
            <button
              onClick={goNext}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#1D9E75] text-white hover:bg-[#0F6E56] transition-all"
            >
              {allDone ? '✓ All done' : 'Complete module'}
            </button>
          )}
        </div>
      </div>

      {/* Module list sidebar */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">All modules</p>
        <div className="space-y-2">
          {modules.map((m, i) => {
            const isDone = completed.includes(i)
            const isActive = i === current
            const isAccessible = i === 0 || completed.includes(i - 1) || completed.includes(i)
            return (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                disabled={!isAccessible}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all
                  ${isActive
                    ? 'bg-[#1A2E3B] text-white'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : isAccessible
                    ? 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <span className="text-base flex-shrink-0">{m.icon}</span>
                <span className="flex-1 leading-snug">{m.title}</span>
                {isDone && <span className="text-[#1D9E75] text-xs font-medium flex-shrink-0">✓ Done</span>}
                {isActive && <span className="text-[#1D9E75] text-xs font-medium flex-shrink-0">← current</span>}
                {!isDone && !isActive && !isAccessible && <span className="text-gray-300 text-xs flex-shrink-0">🔒</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* All complete CTA */}
      {allDone && (
        <div className="mt-6 bg-[#1A2E3B] rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">🎯</p>
          <h3 className="text-white font-semibold text-lg mb-1">All 6 modules complete!</h3>
          <p className="text-gray-400 text-sm mb-4">You know what makes a strong ticket. Now put it into practice.</p>
          <a
            href="/practice"
            className="inline-block bg-[#1D9E75] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0F6E56] transition-all"
          >
            Start Practice →
          </a>
        </div>
      )}

    </div>
  )
}
