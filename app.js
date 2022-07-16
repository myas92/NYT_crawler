require('dotenv').config();
const CronJob = require('cron').CronJob;
const prisma = require('./prisma/prisma-client');
const express = require('express');
const app = express();
const moment = require('moment-jalaali');
const NytCrwaler = require('./business-logic/nyt/nyt-crawler.services');
const router = express.Router();

const nytRouters = require("./business-logic/nyt/nyt.routes");
const HttpError = require('./utils/http-error');
const nytController = require("./business-logic/nyt/nyt.controller");
app.use("/nyt", nytRouters);


app.use((req, res, next) => {
    const error = new HttpError("could not found this route", 404);
    throw error;
})

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500);
    res.json({
      code: error.code || -1,
      message: error.message || "an unknown error occurred!",
    });
  });

// let FirstJob = new CronJob(
// 	'* * * * * sat,sun,mon,tue,wed,thu,fri',
// 	function() {
// 		console.log('You will see this message every second');
// 	},
// 	null,
// 	true,
// 	'Asia/Tehran'
// );
let secondJob= new CronJob(
    '15,45 30-32 6 * * sun,mon',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlQuestionsAnswers()
    },
    null,
    true,
    'Asia/Tehran'
);
//  روزهای شنبه جمعه پینجشنبه چهارشنبه سه شنبه از ساعت ۶ و ۳۰ دقیقه هر ۵ ثانیه اجرا می شود
let ThirdJob = new CronJob(
    // '*/5 22-23 11 * * sat,tue,wed,thu,fri',
    '15,45 30-33 6 * * sat,tue,wed,thu,fri',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswers()
    },
    null,
    true,
    'Asia/Tehran'
);


module.exports = app;
