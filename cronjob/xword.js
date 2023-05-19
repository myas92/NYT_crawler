const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const xwordController = require("../business-logic/xword/xword.controller");

const patternCrawlWeekends = '10,30 0,1 18 * * sat,sun'
const patternCrawlWeekdays = '10,30 0,1 22 * * mon,tue,wed,thu,fri'
// const patternCrawlWeekdays = '*/15 */1 * * * sat,sun,mon,tue,wed,thu,fri'


let firstJobForMaxi = new CronJob(
    // '10,50 0-1 22 * * sat,sun',
    patternCrawlWeekends,
    async function () {
        console.log('Xword Maxi:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await xwordController.crawlMaxi()
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
        console.log('Xword Maxi:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await xwordController.crawlMaxi()
    },
    null,
    true,
    'Asia/Tehran'
);
