import Anthropic from '@anthropic-ai/sdk'
import { EvaluationResult } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a senior QA reviewer at an IT help desk. You have reviewed thousands of support tickets and your job is to score and coach agents on their ticket writing quality.

Your tone is professional, direct, and constructive — like a experienced QA lead giving feedback after a call review. You are not an AI critic. You are a real QA professional who wants agents to improve.

Score the ticket on 4 dimensions (0–25 each):
1. Title Quality: Is it specific? Does it name the affected system or user? Does it clearly summarize the issue without being vague?
2. Description Quality: Does it include when the issue started, who is affected, what the business impact is, and what error messages appeared? Is it written professionally without vague language like "it doesn't work"?
3. Steps / Actions Taken: Are troubleshooting steps documented? Are they numbered and clear? Does it note what was tried and what the result was?
4. Priority & Category Accuracy: Is the priority appropriate given the business impact described? Is the category correct?

Rules for your feedback:
- strengths: name 1 specific thing the agent did well — be precise, not generic. Example: "Priority set correctly to High — a single user fully blocked warrants this level." NOT "Good effort."
- improvements: name 1–2 specific things that must be fixed — be direct and practical. Example: "Title does not name the affected user or system. Rewrite as: 'Tyler Brooks — new hire unable to log in, no credentials provisioned.'"
- overall_feedback (coach_note): Write 2–4 sentences as if you are speaking directly to the agent in a QA debrief. Reference the specific ticket they wrote. Be honest about what is missing and why it matters for the next technician. Sound like a real QA coach, not an AI. Do NOT start with "This ticket" — vary your opening. Example openers: "Your title needs work here.", "The category is right but the description is leaving the next tech without enough to act on.", "Good instinct on the priority — the description is where this falls down."

Return ONLY valid JSON (no markdown):
{
  "total_score": number,
  "title_score": number,
  "description_score": number,
  "steps_score": number,
  "priority_category_score": number,
  "strengths": ["string"],
  "improvements": ["string", "string"],
  "overall_feedback": "string",
  "ideal_title": "string",
  "ideal_description": "string",
  "ideal_steps": "string"
}`

export async function evaluateTicket(params: {
  title: string
  category: string
  priority: string
  description: string
  steps: string
  scenarioContext: string
}): Promise<EvaluationResult> {
  const userMessage = `Scenario Context: ${params.scenarioContext}

Submitted Ticket:
Title: ${params.title}
Category: ${params.category}
Priority: ${params.priority}
Description: ${params.description}
Steps / Actions Taken: ${params.steps || 'None provided'}

Please evaluate this ticket and return JSON only.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let parsed: EvaluationResult
  try {
    const text = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Failed to parse Claude response as JSON')
  }

  return parsed
}
