const express = require("express");
const router = express.Router();

const DailyThemeController = require("./daily-theme.controller");

router.get("/crawl/on-time", DailyThemeController.crawlDailyThemeMaxiAPI);
router.get('/maxi', DailyThemeController.getQuestionsAnswerMaxiAPI);


module.exports = router;