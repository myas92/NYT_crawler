const express = require("express");
const router = express.Router();

const DailyThemeController = require("./daily-theme.controller");

router.get("/crawl/on-time", DailyThemeController.crawlDailyThemeMaxiAPI);
router.get('/crawl-data-maxi', DailyThemeController.crawlDailyThemeMaxiAPI);
router.get('/crawl-data-mini', DailyThemeController.crawlDailyThemeMiniAPI);
router.get('/:date?', DailyThemeController.getQuestionsAnswerAPI);


module.exports = router;