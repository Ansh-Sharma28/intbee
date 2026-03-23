const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const DIFFICULTY_GUIDELINES = {
  Easy:
    "Strong undergraduate level. Single deep idea required. Sources: non-obvious substitution, trig manipulation beyond basic identities, disguised inverse trig/log forms, rational functions needing structure recognition, algebraic–trig mixtures, symmetry observation.",

  Medium:
    "Advanced undergraduate / strong contest level. Multi-step reasoning required. Sources: integration by parts chains, partial fractions with non-trivial decomposition, trig powers/products transformations, completing square leading to inverse trig/log, parameterized expressions, structural transformations, mixed exponential–trig behavior.",

  Hard:
    "Elite competition level (Putnam / Olympiad style insight). Non-obvious transformation required. Sources: Weierstrass substitution, reduction formulas, recursive integrals, differentiation under the integral sign, improper integrals with convergence analysis, symmetry transformations, hidden constants (pi, ln2, Catalan-type), composite structures combining trig, exponential, and algebraic behavior."
};

const SYSTEM_PROMPT =
  "You are a competition mathematician specializing in integration. Output ONLY a valid raw JSON array. No markdown, no explanation, no preamble.";

function isRateLimitError(error) {
  const msg = error?.message || "";
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("rate") ||
    msg.toLowerCase().includes("limit") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

function getSkeleton(expr) {
  return expr
    .replace(/[0-9]/g, "n")
    .replace(/\s+/g, "")
    .replace(/n+n/g, "n")
    .replace(/--/g, "-");
}

async function generateQuestionsBatch(difficulty, amount = 20) {
  const prompt = `Generate exactly ${amount} UNIQUE calculus integration MCQs.

Difficulty: ${difficulty} — ${DIFFICULTY_GUIDELINES[difficulty]}

Strict rules:
- Each integrand must have a DISTINCT structural form
- Avoid textbook templates and predictable patterns
- Prefer surprising substitutions, hidden symmetry, or structural transformations
- Randomize combinations of algebraic, trig, logarithmic, and exponential components
- Include unusual integrand constructions when possible
- Do not repeat integrand patterns
- Difficulty must reflect advanced mathematics students

Notation:
Use only: x^2, sin(x), cos(x), tan(x), ln(x), sqrt(x), e^(x), arctan(x)

MCQ format:
- Exactly 4 options
- Distractors must be mathematically believable
- correctAnswer must exactly match one option
- correctAnswer must end with "+ C"

Fields only:
"integrand", "options", "correctAnswer"

Return ONLY a raw JSON array.`;

  let attempts = 0;

  while (attempts < 3) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: difficulty === "Hard" ? 0.98 : 0.9,
        max_tokens: 3000,
      });

      const raw = response.choices?.[0]?.message?.content || "[]";
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");

      let jsonString = jsonMatch[0];
      const lastComplete = jsonString.lastIndexOf("}");
      if (lastComplete !== -1) jsonString = jsonString.slice(0, lastComplete + 1);
      if (!jsonString.trim().endsWith("]")) jsonString += "]";

      const parsed = JSON.parse(jsonString);

      const valid = parsed.filter(
        (q) =>
          typeof q.integrand === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.options.every((o) => typeof o === "string") &&
          typeof q.correctAnswer === "string" &&
          q.options.includes(q.correctAnswer)
      );

      if (valid.length < amount * 0.7)
        throw new Error(`Validation failed (${valid.length}/${amount})`);

      const usedSkeletons = new Set();
      const diverse = [];

      for (const q of valid.sort(() => Math.random() - 0.5)) {
        const skeleton = getSkeleton(q.integrand);
        if (usedSkeletons.has(skeleton)) continue;
        usedSkeletons.add(skeleton);
        diverse.push({
          ...q,
          options: q.options.sort(() => Math.random() - 0.5),
          difficulty,
        });
        if (diverse.length === amount) break;
      }

      if (diverse.length < amount * 0.6)
        throw new Error("Low diversity batch");

      return diverse;

    } catch (error) {
      if (isRateLimitError(error)) {
        console.error("Groq rate limit reached.");
        throw new Error("AI_RATE_LIMIT_REACHED");
      }

      attempts++;
      console.log(`Groq attempt ${attempts} failed:`, error.message);
      if (attempts >= 3) throw new Error("AI_GENERATION_FAILED");
      await sleep(2000 * attempts);
    }
  }
}

module.exports = { generateQuestionsBatch };