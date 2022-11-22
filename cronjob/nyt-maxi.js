const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const nytController = require("../business-logic/nyt/nyt.controller");

const patternCrawlWeekends = '10,50 0-1 18 * * sat,sun'
const patternCrawlWeekdays = '10,50 0-1 22 * * mon,tue,wed,thu,fri'
const patternSendDataWeekends = '0 2 18 * * sat,sun'
const patternSendDataWeekdays = '0 2 22 * * mon,tue,wed,thu,fri';

let firstJobForMaxi = new CronJob(
    // '10,50 0-1 22 * * sat,sun',
    patternCrawlWeekends,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMaxi()
    },
    null,
    true,
    'America/New_York'
);


let secondJobForMaxi = new CronJob(
    // '*/5 9 9 * * sat,tue,wed,thu,fri',
    // '10,50 0-1 2 * * sat,tue,wed,thu,fri',
    patternCrawlWeekdays,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMaxi()
    },
    null,
    true,
    'America/New_York'
);


// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
let firstSendDataToProductionForMaxi = new CronJob(
    // '0 2 22 * * sat,sun',
    patternSendDataWeekends,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMaxi()
    },
    null,
    true,
    'America/New_York'
);
// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
let secondsendDataToProductionForMaxi = new CronJob(
    // '0 2 2 * * sat,tue,wed,thu,fri',
    patternSendDataWeekdays,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMaxi()
    },
    null,
    true,
    'America/New_York'
);
