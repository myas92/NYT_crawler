const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const sevenLetterController = require("../business-logic/seven-little-words/seven-little-words-crawler.controller");

let sevenLetterJob = new CronJob(
    // '0 8 18 * * sat,sun,mon,tue,wed,thu,fri',
    '1 0 0 * * sat,sun,mon,tue,wed,thu,fri',
    async function () {
        console.log('Seven Letter Words:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))

        await sevenLetterController.crawlSevenLittleWords()
    },
    null,
    true,
    'Asia/Tehran'
);