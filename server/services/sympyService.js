const axios = require("axios");

function cleanExpression(expr) {
  if (!expr) return "";

  return expr
    .replace(/\+ ?C/g, "")
    .replace(/\^/g, "**")
    .replace(/(\d)([a-zA-Z])/g, "$1*$2")
    .replace(/([a-zA-Z])(\d)/g, "$1*$2")
    .replace(/\\frac{([^}]*)}{([^}]*)}/g, "($1)/($2)")
    .replace(/\\left|\\right/g, "")
    .replace(/\s+/g, "")
    .trim();
}

async function verifyBatch(integrands, answers) {
  const cleanedIntegrands = integrands.map(cleanExpression);
  const cleanedAnswers = answers.map(cleanExpression);

  try {
    const res = await axios.post(
      `${process.env.PYTHON_SERVICE}/verify-batch`,
      {
        integrands: cleanedIntegrands,
        answers: cleanedAnswers
      },
      { timeout: 15000 }
    );

    const results = res.data?.results || [];

    if (results.length !== cleanedAnswers.length) {
      console.error("SymPy returned mismatched result length");
      throw new Error("SYMPY_INVALID_RESPONSE");
    }

    return results;

  } catch (error) {
    console.error("SymPy verification failed:", error.message);

    // Stop generation instead of silently failing everything
    throw new Error("SYMPY_SERVICE_UNAVAILABLE");
  }
}

module.exports = { verifyBatch };