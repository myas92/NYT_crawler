const express = require("express");
const router = express.Router();

const nytController = require("./nyt.controller");

router.get("/crawl/on-time:type", nytController.crawlMainQuestionAnswersAPI);
router.get("/crawl/on-time", nytController.crawlMainQuestionAnswersAPI);
router.get("/crawl-data-maxi", nytController.crawlQuestionsAnswersBasedLinksAPI);
router.get('/crawl-data-mini', nytController.doubleCheckDataForMini);
router.get('/send-data-mini', nytController.sendDataToProductionForMini);
router.get('/send-data-maxi', nytController.sendDataToProductionForMaxi);
router.get('/:date?', nytController.getQuestionsAnswerAPI);

module.exports = router;