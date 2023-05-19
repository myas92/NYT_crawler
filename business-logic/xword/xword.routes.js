const express = require("express");
const router = express.Router();

const XWordController = require("./xword.controller");

router.get('/crawl-data-maxi', XWordController.crawlMaxiAPI);
router.get('/send-data-maxi', XWordController.sendDataToProductionForMaxi);
router.get('/:date?', XWordController.getQuestionsAnswerAPI);

module.exports = router;