import { createClient } from '@/lib/supabase/server'
import { normalizeScenario } from '@/lib/scenarios'
import { Scenario } from '@/types'
import WorkspaceClient from './WorkspaceClient'

export default async function PracticePage() {
  const supabase = createClient()
  const { data: scenarios, error } = await supabase
    .from('scenarios')
    .select('id, title, scenario_number, caller_name, department, situation_text, error_message, urgency_note, correct_priority, correct_category, tier, is_active, created_at')
    .eq('is_active', true)
    .order('scenario_number', { ascending: true })

  const scenarioCards = (scenarios ?? []).map((s) => normalizeScenario(s)) as Scenario[]

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl border border-red-100 p-12 text-center">
          <p className="text-red-600 font-medium">Could not load scenarios.</p>
          <p className="text-gray-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return <WorkspaceClient scenarios={scenarioCards} />
}
