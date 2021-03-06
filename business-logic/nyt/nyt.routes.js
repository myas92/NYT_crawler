const express = require("express");
const router = express.Router();

const nytController = require("./nyt.controller");

router.get("/crawl/on-time", nytController.crawlMainQuestionAnswersAPI);
router.get("/crawl/links", nytController.crawlQuestionsAnswersBasedLinksAPI);
router.get('/:date?', nytController.getQuestionsAnswerAPI);


module.exports = router;