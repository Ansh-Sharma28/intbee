const axios = require("axios");

function cleanExpression(expr) {
  if (!expr) return "";

  return expr
    .replace(/\\int\s*/g, "")
    .replace(/\s*d[a-zA-Z]\b/g, "")
    .replace(/\+\s*C\b/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function verifyBatch(integrands, answers) {
  const cleanedIntegrands = integrands.map(cleanExpression);
  const cleanedAnswers = answers.map(cleanExpression);

  const res = await axios.post(
    `${process.env.PYTHON_SERVICE}/verify-batch`,
    {
      integrands: cleanedIntegrands,
      answers: cleanedAnswers,
    },
    { timeout: 30000 }
  );

  const results = res.data?.results || [];

  if (!Array.isArray(results)) {
    throw new Error("SYMPY_BAD_RESPONSE");
  }

  return results;
}

module.exports = { verifyBatch };