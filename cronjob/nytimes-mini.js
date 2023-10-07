const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const controller = require("../business-logic/nytimes/nytimes.controller");
const patternCrawlWeekends = '10 0 18 * * sat,sun'
const patternCrawlWeekdays = '10 0 22 * * mon,tue,wed,thu,fri'


new CronJob(
    patternCrawlWeekends,
    async function () {
        console.log('nytimes.com/mini :--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await controller.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'America/New_York'
);


new CronJob(
    patternCrawlWeekdays,
    async function () {
        console.log('nytimes.com/mini :--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await controller.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'America/New_York'
);
