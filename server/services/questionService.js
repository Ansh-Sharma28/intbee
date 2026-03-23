const Question = require("../models/Question");
const { generateQuestionsBatch } = require("./aiService");
const { verifyBatch } = require("./sympyService");

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function generateBatch(difficulty, targetAmount = 20) {
  let collected = [];
  const seenIntegrands = new Set();
  let safetyCounter = 0;

  while (collected.length < targetAmount) {
    safetyCounter++;
    if (safetyCounter > 25) {
      throw new Error("GENERATION_STUCK");
    }

    const remaining = targetAmount - collected.length;
    console.log(`Generating questions. Stored: ${collected.length}/${targetAmount}`);

    try {
      const requestAmount = Math.min(20, remaining + 5);
      const aiQuestions = await generateQuestionsBatch(difficulty, requestAmount);

      if (!aiQuestions || aiQuestions.length === 0) {
        console.log("AI returned empty batch");
        continue;
      }

      // Step 1: remove duplicates inside AI batch + current round
      const uniqueAI = aiQuestions.filter((q) => {
        const key = q.integrand.replace(/\s+/g, "");
        if (seenIntegrands.has(key)) return false;
        seenIntegrands.add(key);
        return true;
      });

      if (uniqueAI.length === 0) continue;

      // Step 2: remove integrands already in Mongo
      const integrands = uniqueAI.map((q) =>
        q.integrand.replace(/\s+/g, "")
      );

      const existing = await Question.find(
        { difficulty, integrand: { $in: integrands } },
        { integrand: 1 }
      ).lean();

      const existingSet = new Set(
        existing.map((q) => q.integrand.replace(/\s+/g, ""))
      );

      const newQuestions = uniqueAI.filter(
        (q) => !existingSet.has(q.integrand.replace(/\s+/g, ""))
      );

      if (newQuestions.length === 0) continue;

      // Step 3: verify with SymPy
      const verifyIntegrands = newQuestions.map(q => q.integrand);
      const verifyAnswers = newQuestions.map(q => q.correctAnswer);

      const verificationResults = await verifyBatch(
        verifyIntegrands,
        verifyAnswers
      );

      const validDocs = [];

      for (let i = 0; i < newQuestions.length; i++) {
        if (
          verificationResults &&
          verificationResults[i] &&
          collected.length + validDocs.length < targetAmount
        ) {
          const q = newQuestions[i];

          validDocs.push({
            difficulty,
            integrand: q.integrand,
            options: q.options,
            correctAnswer: q.correctAnswer,
            verified: true,
          });
        }
      }

      // Step 4: insert safely
      for (const doc of validDocs) {
        try {
          await Question.create(doc);
          collected.push(doc);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`Skipped duplicate integrand: ${doc.integrand}`);
          } else {
            throw err;
          }
        }
      }

      console.log(`Stored so far: ${collected.length}`);

    } catch (err) {
      // IMPORTANT: stop immediately if AI limit reached
      if (err.message === "AI_RATE_LIMIT_REACHED") {
        console.error("AI limit reached. Stopping batch generation.");
        throw err;
      }

      console.error("Batch generation error:", err.message);
      await sleep(2000);
    }
  }

  return collected.slice(0, targetAmount);
}

async function getNextQuestion(difficulty) {
  let question = await Question.findOneAndDelete(
    { difficulty },
    { sort: { createdAt: 1 } }
  );

  if (!question) {
    console.log("Question cache empty. Generating batch...");
    const batch = await generateBatch(difficulty, 20);

    if (!batch || batch.length === 0) {
      throw new Error("FAILED_TO_GENERATE_QUESTIONS");
    }

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
};