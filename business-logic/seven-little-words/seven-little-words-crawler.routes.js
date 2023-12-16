const express = require("express");
const router = express.Router();

const SevenLittleWordsController = require("./seven-little-words-crawler.controller");

router.get("/crawl", SevenLittleWordsController.crawlSevenLittleWordsAPI);
router.get("/send-data", SevenLittleWordsController.sendDataToProductionForSevenLittlesWords);
router.get('/', SevenLittleWordsController.getQuestionsAnswerAPI);


module.exports = router;