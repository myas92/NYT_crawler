const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const dailyThemeController = require("../business-logic/daily-theme/daily-theme.controller");

let dailyThemeMaxiJob = new CronJob(
    '0 0 10 * * sat,sun,mon,tue,wed,thu,fri',
    async function () {
        console.log('Daily Theme Maxi:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))

        await dailyThemeController.crawlDailyThemeMaxi()
    },
    null,
    true,
    'Asia/Tehran'
);

let dailyThemeMiniJob = new CronJob(
    '0 0 10 * * sat,sun,mon,tue,wed,thu,fri',
    async function () {
        console.log('Daily Theme Maxi:--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))

        await dailyThemeController.crawlDailyThemeMini()
    },
    null,
    true,
    'Asia/Tehran'
);