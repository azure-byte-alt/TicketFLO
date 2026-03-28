exports.handler = async function(event, context) {
const headers = {
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type'
};
if (event.httpMethod === 'OPTIONS') {
return { statusCode: 200, headers, body: '' };
}
if (event.httpMethod !== 'POST') {
return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}
const { ticket, scenario } = JSON.parse(event.body);
if (!ticket || !scenario) {
return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ticket or scenario' }) };
}
const prompt = `You are an expert IT help desk trainer and ticket quality coach. A trainee just submitted the following help desk ticket in response to a practice scenario.
SCENARIO:
TYPE: ${scenario.type}
SCENARIO: ${scenario.text}
CALLER: ${scenario.caller.name} | Dept: ${scenario.caller.dept} | Location: ${scenario.caller.location}
TRAINEE'S TICKET:
SUBJECT: ${ticket.subject}
PRIORITY: ${ticket.priority}
CATEGORY: ${ticket.category}
IMPACT: ${ticket.impact || '(not selected)'}
DESCRIPTION: ${ticket.desc}
STEPS TAKEN: ${ticket.steps || '(none)'}
RESOLUTION / NEXT ACTION: ${ticket.action || '(none)'}
Evaluate this ticket and return ONLY a valid JSON object with no extra text, markdown, or backticks. Use this exact structure:
{
"strengths": ["<specific strength based on what they actually wrote>"],
"improvements": ["<specific, actionable improvement>"],
"critical": ["<critical missing element, if any — leave empty array if none>"],
"coach_note": "<1-2 sentences of personalized encouragement and targeted coaching based on this specific ticket>"
}
Rules:

Be specific — reference what they actually wrote, not generic advice
strengths: 1-2 items max, only if genuinely earned
improvements: 1-3 items, concrete and actionable
critical: only truly critical omissions (identity verification missing on security tickets, no error message on error tickets, etc.)
coach_note: warm but direct — like a real supervisor reviewing their work
If a field is blank or missing, call it out specifically`;
try {
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-sonnet-4-20250514',
max_tokens: 1000,
messages: [{ role: 'user', content: prompt }]
})
});
const data = await response.json();
const raw = data.content.find(b => b.type === 'text')?.text || '{}';
const clean = raw.replace(/json|/g, '').trim();
const result = JSON.parse(clean);
return { statusCode: 200, headers, body: JSON.stringify(result) };
} catch (err) {
console.error('API error:', err);
return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to get AI feedback' }) };
}
};
