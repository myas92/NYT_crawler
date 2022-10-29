const express = require("express");
const router = express.Router();

const SevenLittleWordsController = require("./seven-little-words-crawler.controller");

router.get("/crawl/on-time", SevenLittleWordsController.crawlSevenLittleWordsAPI);
router.get('/:date?', SevenLittleWordsController.getQuestionsAnswerAPI);


module.exports = router;