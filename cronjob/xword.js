const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const xwordController = require("../business-logic/xword/xword.controller");

let xwordMaxi = new CronJob(
    '0 0 7 * * sat,sun,mon,tue,wed,thu,fri',
    async function () {
        console.log('Xword Maxi:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))

        await xwordController.crawlMaxi()
    },
    null,
    true,
    'Asia/Tehran'
);
