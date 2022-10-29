const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const nytController = require("../business-logic/nyt/nyt.controller");

let firstJobForMaxi = new CronJob(
    '10,50 0-1 22 * * sat,sun',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMaxi()
    },
    null,
    true,
    'Etc/UTC'
);


let secondJobForMaxi = new CronJob(
    // '*/5 9 9 * * sat,tue,wed,thu,fri',
    '10,50 0-1 2 * * sat,tue,wed,thu,fri',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMaxi()
    },
    null,
    true,
    'Etc/UTC'
);


// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
let firstSendDataToProductionForMaxi = new CronJob(
    '0 2 22 * * sat,sun',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMaxi()
    },
    null,
    true,
    'Etc/UTC'
);
// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
let secondsendDataToProductionForMaxi = new CronJob(
    '0 2 2 * * sat,tue,wed,thu,fri',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMaxi()
    },
    null,
    true,
    'Etc/UTC'
);
