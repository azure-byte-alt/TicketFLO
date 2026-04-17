import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Scenario } from '@/types'

const difficultyColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

const categoryColor: Record<string, string> = {
  'Account Access': 'bg-purple-100 text-purple-700',
  Hardware: 'bg-gray-100 text-gray-700',
  Software: 'bg-blue-100 text-blue-700',
  Network: 'bg-cyan-100 text-cyan-700',
  Performance: 'bg-orange-100 text-orange-700',
  Other: 'bg-slate-100 text-slate-700',
}

export default async function PracticePage() {
  const supabase = createClient()
  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('*')
    .order('scenario_number', { ascending: true })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a2744]">Practice Scenarios</h1>
        <p className="text-gray-500 mt-1">
          Choose a real-world IT scenario to write a help desk ticket for
        </p>
      </div>

      {!scenarios || scenarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">No scenarios available yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Run the SQL schema in your Supabase dashboard to seed scenarios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {(scenarios as Scenario[]).map((scenario) => (
            <div
              key={scenario.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col hover:border-[#4db8a4] hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      categoryColor[scenario.category] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {scenario.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      difficultyColor[scenario.difficulty] ?? 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {scenario.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1a2744] mb-2 leading-snug">{scenario.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{scenario.description}</p>
              </div>
              <div className="px-5 pb-5">
                <Link
                  href={`/practice/${scenario.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a2744] hover:bg-[#243456] text-white rounded-lg text-sm font-medium transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Start Scenario
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
