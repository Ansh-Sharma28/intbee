const service = require("../services/questionService");

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];

/**
 * Get the next available verified question
 */
exports.getQuestion = async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty." });
    }

    const question = await service.getNextQuestion(difficulty);

    if (!question) {
      return res.status(404).json({ message: "No questions available." });
    }

    res.json(question);

  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Failed to fetch question." });
  }
};


/**
 * Start a new round (generate cached questions)
 */
exports.startRound = async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty." });
    }

    const batch = await service.generateBatch(difficulty, 20);

    res.json({
      message: "Round ready",
      questionsGenerated: batch.length
    });

  } catch (error) {
    console.error("Error starting round:", error);
    res.status(500).json({ message: "Failed to start round." });
  }
};


/**
 * End a round (clear cached questions)
 */
exports.endRound = async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty." });
    }

    await service.deleteRound(difficulty);

    res.json({ message: "Round ended" });

  } catch (error) {
    console.error("Error ending round:", error);
    res.status(500).json({ message: "Failed to end round." });
  }
};