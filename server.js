require('dotenv').config();
const CronJob = require('cron').CronJob;
const prisma = require('./prisma/prisma-client');
const express = require('express');
const app = express();
const moment = require('moment-jalaali');
const NytCrwaler = require('./bussiness-logic/nyt/nytCrawler.services');
const router = express.Router();

const nytRouters = require("./bussiness-logic/nyt/nyt.routes");
const HttpError = require('./utils/http-error');

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
let secondJob = new CronJob(
    '* * * * * sun,mon',
    function () {
        console.log('You will see this message every sun,mon ');
    },
    null,
    true,
    'Asia/Tehran'
);
//  روزهای شنبه جمعه پینجشنبه چهارشنبه سه شنبه از ساعت ۶ و ۳۰ دقیقه هر ۵ ثانیه اجرا می شود
let ThirdJob = new CronJob(
    '*/5 12 16 * * sat,tue,wed,thu,fri',
    async function () {
        console.log('You will see this message every sat,tue,wed,thu,fri');
    },
    null,
    true,
    'Asia/Tehran'
);




app.listen(process.env.PORT, () => {
    console.log('App running on port:', process.env.PORT)
})