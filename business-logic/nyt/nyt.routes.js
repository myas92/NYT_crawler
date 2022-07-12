const express = require("express");
const router = express.Router();

const nytController = require("./nyt.controller");

router.get("/crawl/:date?", nytController.crawlQuestionsAnswers);
router.get('/:date?', nytController.getQuestionsAnswer);


module.exports = router;