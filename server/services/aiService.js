const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/*
Contest-style difficulty tiers
Compact but strong enough to guide the model
*/
const DIFFICULTY_RULES = {
  Easy: `
Contest warm-up integrals.

Requirements:
- Not trivial power rule
- Small substitution or identity required
- Light algebra or trig manipulation
- May involve e^ax, sin(ax), rational expressions
`,

  Medium: `
Competition-level integrals.

Use combinations of:
- integration by parts
- trig identities
- rational decomposition
- completing the square
- clever substitution
`,

  Hard: `
Advanced contest integrals.

Prefer:
- elegant substitutions
- non-obvious simplifications
- symmetry tricks
- recursive integration by parts
- challenging rational structures
`,
};

const SYSTEM_PROMPT = `
You create high-quality calculus competition questions.

Output ONLY a raw JSON array.

Each object:
{
  "integrand": "LaTeX integral",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "must exactly match one option"
}

Rules:
- Integrals must be interesting and non-trivial
- Avoid basic textbook problems
- Avoid repeating the same integral pattern in the batch
- Exactly 4 options
- Every option ends with + C
- Options must be plausible mistakes
`;

function isRateLimitError(error) {
  const msg = error?.message || "";
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("rate") ||
    msg.toLowerCase().includes("limit")
  );
}

function safelyParseJSON(raw) {
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const start = cleaned.indexOf("[");
  if (start === -1) return [];

  let json = cleaned.slice(start);

  while (json.length > 10) {
    try {
      return JSON.parse(json);
    } catch {
      const last = json.lastIndexOf("},");
      if (last === -1) break;
      json = json.slice(0, last + 1) + "]";
    }
  }

  return [];
}

function buildPrompt(difficulty, amount) {
  return `
Generate ${amount} ${difficulty} integration MCQs.

Difficulty:
${DIFFICULTY_RULES[difficulty]}

Strict rules:
1. integrand must contain \\int ... dx
2. options must contain exactly 4 answers
3. correctAnswer must match one option exactly
4. every option must end with + C
5. avoid trivial integrals like ∫x dx or ∫sin(x) dx

Return raw JSON only.
`;
}

function isStructurallyValid(q) {
  if (!q) return false;

  if (typeof q.integrand !== "string") return false;
  if (!q.integrand.includes("\\int")) return false;

  if (!Array.isArray(q.options)) return false;
  if (q.options.length !== 4) return false;
  if (q.options.some((o) => typeof o !== "string")) return false;

  if (typeof q.correctAnswer !== "string") return false;
  if (!q.options.includes(q.correctAnswer)) return false;

  if (!/\+\s*C\s*$/.test(q.correctAnswer)) return false;

  if (q.options.some((o) => o.includes("\\int"))) return false;

  return true;
}

async function generateQuestionsBatch(difficulty, amount = 20) {
  let attempts = 0;

  while (attempts < 3) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(difficulty, amount) },
        ],
        temperature:
          difficulty === "Hard"
            ? 0.95
            : difficulty === "Medium"
            ? 0.85
            : 0.8,
        max_tokens: 3500,
      });

      const raw = response.choices?.[0]?.message?.content || "[]";

      console.log("===== GROQ RAW RESPONSE =====");
      console.log(raw);

      const parsed = safelyParseJSON(raw);
      const valid = parsed.filter(isStructurallyValid);

      console.log(`Valid after parsing: ${valid.length}/${parsed.length}`);

      return valid;
    } catch (error) {
      if (isRateLimitError(error)) {
        throw new Error("AI_RATE_LIMIT_REACHED");
      }

      attempts++;
      console.log(`Groq retry ${attempts}`);
      await sleep(1500 * attempts);
    }
  }

  return [];
}

module.exports = { generateQuestionsBatch };