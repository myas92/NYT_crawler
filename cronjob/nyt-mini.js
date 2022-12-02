const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const nytController = require("../business-logic/nyt/nyt.controller");
const patternCrawlWeekends = '10 0 18 * * sat,sun'
const patternCrawlWeekdays = '10 0 22 * * mon,tue,wed,thu,fri'
const patternSendDataWeekends = '0 2 18 * * sat,sun'
const patternSendDataWeekdays = '0 2 22 * * mon,tue,wed,thu,fri';

let firstJobForMini = new CronJob(
    // '10,15,20,30,40 0 22 * * sat,sun',
    // '10,15,20,30,40 0 23 * * sat,sun', Etc/UTC
    patternCrawlWeekends,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'America/New_York'
);


// let firstJobForMiniDoubleCheck = new CronJob(
//     // '0 4 22 * * sat,sun',
//     '0 2 18 * * sat,sun',
//     async function () {
//         console.log('DoubleCheck--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
//         await nytController.doubleCheckDataForMini()
//     },
//     null,
//     true,
//     'America/New_York'
// );



//  روزهای شنبه جمعه پینجشنبه چهارشنبه سه شنبه از ساعت ۶ و ۳۰ دقیقه هر ۵ ثانیه اجرا می شود
let secondJobForMini = new CronJob(
    // '*/5 9 9 * * sat,tue,wed,thu,fri',
    // '10,15,20,30,40 0 2 * * sat,tue,wed,thu,fri',
    patternCrawlWeekdays,
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'America/New_York'
);


// let secondJobForMiniDoubleCheck = new CronJob(
//     // '*/5 9 9 * * sat,tue,wed,thu,fri',
//     // '0 4 2 * * sat,tue,wed,thu,fri',
//     '0 2 22 * * sat,tue,wed,thu,fri',
//     async function () {
//         console.log('DoubleCheck--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
//         await nytController.doubleCheckDataForMini()
//     },
//     null,
//     true,
//     'America/New_York'
// );



// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
// let firstSendDataToProductionForMini = new CronJob(
//     // '30 4 22 * * sat,sun',
//     patternSendDataWeekends,
//     async function () {
//         console.log('----> Send data for game-mini <----', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
//         await nytController.sendDataToProductionForMini()
//     },
//     null,
//     true,
//     'America/New_York'
// );
// ارسال داده ها به سمت سرور عملباتی در روزهای کاری
// let secondsendDataToProductionForMini = new CronJob(
//     // '30 4 2 * * sat,tue,wed,thu,fri',
//     patternSendDataWeekdays,
//     async function () {
//         console.log('----> Send data for game-mini <----', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
//         await nytController.sendDataToProductionForMini()
//     },
//     null,
//     true,
//     'America/New_York'
// );
