const Question = require("../models/Question");
const { generateQuestionsBatch } = require("./aiService");
const { verifyBatch } = require("./sympyService");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function normalizeLatex(expr) {
  if (!expr) return "";
  return expr
    .replace(/\s+/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\,/g, "")
    .replace(/\+C/g, "")
    .replace(/\^\{([^}]*)\}/g, "^$1")
    .trim();
}

/* NEW — fixes bad LaTeX produced by AI */
function fixIntegralLatex(expr) {
  if (!expr) return expr;

  return expr
    // integral spacing
    .replace(/\\intx/g, "\\int x")
    .replace(/\\int([a-zA-Z])/g, "\\int $1")

    // trig spacing
    .replace(/\\sinx/g, "\\sin x")
    .replace(/\\cosx/g, "\\cos x")
    .replace(/\\tanx/g, "\\tan x")

    // inverse trig fixes
    .replace(/arctanx/g, "\\arctan(x)")
    .replace(/arctan\(/g, "\\arctan(")
    .replace(/arc\s*tan/g, "\\arctan")

    // log / ln fixes
    .replace(/\\lnx/g, "\\ln x")

    // ensure dx spacing
    .replace(/dx$/g, " dx")
    .replace(/dy$/g, " dy")
    .replace(/dz$/g, " dz");
}

async function generateBatch(difficulty, targetAmount = 20) {
  let collected = [];
  let attempts = 0;

  while (collected.length < targetAmount) {
    attempts++;
    console.log(`Progress: ${collected.length}/${targetAmount}`);

    if (attempts > 40) throw new Error("GENERATION_STUCK");

    try {
      const needed = targetAmount - collected.length;

      const aiQuestions = await generateQuestionsBatch(
        difficulty,
        Math.min(needed * 2, 20)
      );

      if (!aiQuestions.length) continue;

      console.log(`AI returned: ${aiQuestions.length}`);

      /* FIX AI LATEX HERE */
      aiQuestions.forEach((q) => {
        q.integrand = fixIntegralLatex(q.integrand);
      });

      const integrands = aiQuestions.map((q) =>
        normalizeLatex(q.integrand)
      );

      const existing = await Question.find(
        { difficulty, integrand: { $in: integrands } },
        { integrand: 1 }
      ).lean();

      const existingSet = new Set(
        existing.map((q) => normalizeLatex(q.integrand))
      );

      const newQuestions = aiQuestions.filter(
        (q) => !existingSet.has(normalizeLatex(q.integrand))
      );

      if (!newQuestions.length) {
        console.log("All already in DB, retrying...");
        continue;
      }

      console.log(`New questions: ${newQuestions.length}`);

      const verifyResults = await verifyBatch(
        newQuestions.map((q) => q.integrand),
        newQuestions.map((q) => q.correctAnswer)
      );

      const passCount = verifyResults.filter(Boolean).length;
      console.log(`SymPy verified: ${passCount}/${newQuestions.length}`);

      for (let i = 0; i < newQuestions.length; i++) {
        if (!verifyResults[i]) continue;

        try {
          const doc = await Question.create({
            difficulty,
            integrand: newQuestions[i].integrand,
            options: newQuestions[i].options,
            correctAnswer: newQuestions[i].correctAnswer,
            verified: true,
          });

          collected.push(doc);

          if (collected.length >= targetAmount) break;
        } catch (err) {
          if (err.code !== 11000) throw err;
        }
      }
    } catch (err) {
      if (err.message === "AI_RATE_LIMIT_REACHED") throw err;

      console.log("Retrying batch:", err.message);
      await sleep(1500);
    }
  }

  return collected;
}

async function fetchAllQuestions(difficulty) {
  return await Question.aggregate([
    { $match: { verified: true, difficulty } },
    { $sample: { size: 50 } },
  ]);
}

async function getNextQuestion(difficulty) {
  let question = await Question.findOneAndDelete(
    { difficulty },
    { sort: { createdAt: 1 } }
  );

  if (!question) {
    console.log("Cache empty → generating...");
    await generateBatch(difficulty, 20);

    question = await Question.findOneAndDelete(
      { difficulty },
      { sort: { createdAt: 1 } }
    );
  }

  return question;
}

async function deleteRound(difficulty) {
  await Question.deleteMany({ difficulty });
}

module.exports = {
  generateBatch,
  getNextQuestion,
  deleteRound,
  fetchAllQuestions,
};