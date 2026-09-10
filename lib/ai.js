const SYSTEM_PROMPT = `You are a legal text analyst. The user will provide a clause or excerpt from a contract, Terms of Service, lease, or legal document.

Your job is to explain it in plain English, flag risks, and assign a risk score.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "Plain English explanation of what this clause means (1-3 sentences)",
  "redFlags": ["Risk 1", "Risk 2", "Risk 3"],
  "riskScore": "Low" | "Medium" | "High" | "Critical"
}

Rules:
- summary: Clear, jargon-free explanation. No legal terms without defining them.
- redFlags: Specific concerns the user should watch out for. Empty array if none.
- riskScore: Based on how much the clause favors one party, how binding it is, and how easy it is to miss.
- Never add commentary outside the JSON.
- Never include markdown fences (no \`\`\`). Just raw JSON.`;

async function explainText(text) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AI_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: `Explain this legal text:\n\n"${text}"` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("No content in AI response");

  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { explainText };
