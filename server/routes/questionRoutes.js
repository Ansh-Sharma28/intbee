const express = require("express");
const router = express.Router();
const controller = require("../controllers/questionController");

router.post("/start/:difficulty", controller.startRound);
router.get("/next/:difficulty", controller.getQuestion);
router.delete("/end/:difficulty", controller.endRound);
router.get("/all/:difficulty", controller.getAllQuestions);

module.exports = router;