import { NextRequest, NextResponse } from 'next/server'
import { createClient, getToken } from '@/lib/supabase/server'
import { evaluateTicket } from '@/lib/anthropic'

export async function POST(request: NextRequest) {
  const token = getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    scenarioId?: string
    title?: string
    category?: string
    priority?: string
    description?: string
    steps?: string
    scenarioContext?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { scenarioId, title, category, priority, description, steps = '', scenarioContext = '' } = body

  if (!title?.trim() || !category || !priority || !description?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields: title, category, priority, description' },
      { status: 400 }
    )
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      user_id: user.id,
      scenario_id: scenarioId ?? null,
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      steps_to_reproduce: steps.trim() || null,
    })
    .select('id')
    .single()

  if (ticketError || !ticket) {
    console.error('Ticket insert error:', ticketError)
    return NextResponse.json({ error: 'Failed to save ticket' }, { status: 500 })
  }

  let evaluation
  try {
    evaluation = await evaluateTicket({
      title: title.trim(),
      category,
      priority,
      description: description.trim(),
      steps: steps.trim(),
      scenarioContext,
    })
  } catch (err) {
    console.error('Claude evaluation error:', err)
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return NextResponse.json({ error: 'AI evaluation failed. Please try again.' }, { status: 500 })
  }

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .insert({
      ticket_id: ticket.id,
      user_id: user.id,
      total_score: evaluation.total_score,
      title_score: evaluation.title_score,
      description_score: evaluation.description_score,
      steps_score: evaluation.steps_score,
      priority_category_score: evaluation.priority_category_score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      overall_feedback: evaluation.overall_feedback,
      ideal_title: evaluation.ideal_title,
      ideal_description: evaluation.ideal_description,
      ideal_steps: evaluation.ideal_steps,
    })
    .select('id')
    .single()

  if (feedbackError || !feedback) {
    console.error('Feedback insert error:', feedbackError)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }

  return NextResponse.json({ feedbackId: feedback.id })
}
