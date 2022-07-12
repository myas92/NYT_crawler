const express = require("express");
const router = express.Router();

const nytController = require("./nyt.controller");

router.get("/crawl/:date?", nytController.crawlQuestionsAnswersAPI);
router.get('/:date?', nytController.getQuestionsAnswerAPI);


module.exports = router;