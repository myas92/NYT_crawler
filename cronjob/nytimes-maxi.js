const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const controller = require("../business-logic/nytimes/nytimes.controller");

const patternCrawlWeekends = '10,30 0,1 18 * * sat,sun'
const patternCrawlWeekdays = '10,30 0,1 22 * * mon,tue,wed,thu,fri'
// const patternCrawlWeekdays = '*/30 * * * * sat,sun,mon,tue,wed,thu,fri'


 new CronJob(
    patternCrawlWeekends,
    async function () {
        console.log('nytimes.com/maxi :--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await controller.crawlMaxi()
    },
    null,
    true,
    'America/New_York'
);


new CronJob(
    patternCrawlWeekdays,
    async function () {
        console.log('nytimes.com/maxi :--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await controller.crawlMaxi()
    },
    null,
    true,
    'America/New_York'
);
