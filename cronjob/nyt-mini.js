const { CronJob } = require('cron')
const moment = require('moment-jalaali');

const nytController = require("../business-logic/nyt/nyt.controller");

let firstJobForMini = new CronJob(
    // '10,15,20,30,40 0 22 * * sat,sun',
    '10,15,20,30,40 0 23 * * sat,sun',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'Etc/UTC'
);


let firstJobForMiniDoubleCheck = new CronJob(
    // '0 4 22 * * sat,sun',
    '0 4 23 * * sat,sun',
    async function () {
        console.log('DoubleCheck--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.doubleCheckDataForMini()
    },
    null,
    true,
    'Etc/UTC'
);



//  ط±ظˆط²ظ‡ط§غŒ ط´ظ†ط¨ظ‡ ط¬ظ…ط¹ظ‡ ظ¾غŒظ†ط¬ط´ظ†ط¨ظ‡ ع†ظ‡ط§ط±ط´ظ†ط¨ظ‡ ط³ظ‡ ط´ظ†ط¨ظ‡ ط§ط² ط³ط§ط¹طھ غ¶ ظˆ غ³غ° ط¯ظ‚غŒظ‚ظ‡ ظ‡ط± غµ ط«ط§ظ†غŒظ‡ ط§ط¬ط±ط§ ظ…غŒ ط´ظˆط¯
let secondJobForMini = new CronJob(
    // '*/5 9 9 * * sat,tue,wed,thu,fri',
    // '10,15,20,30,40 0 2 * * sat,tue,wed,thu,fri',
    '10,15,20,30,40 0 3 * * sat,tue,wed,thu,fri',
    async function () {
        console.log(moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.crawlMainQuestionAnswersForMini()
    },
    null,
    true,
    'Etc/UTC'
);


let secondJobForMiniDoubleCheck = new CronJob(
    // '*/5 9 9 * * sat,tue,wed,thu,fri',
    // '0 4 2 * * sat,tue,wed,thu,fri',
    '0 4 3 * * sat,tue,wed,thu,fri',
    async function () {
        console.log('DoubleCheck--->', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.doubleCheckDataForMini()
    },
    null,
    true,
    'Etc/UTC'
);



// ط§ط±ط³ط§ظ„ ط¯ط§ط¯ظ‡ ظ‡ط§ ط¨ظ‡ ط³ظ…طھ ط³ط±ظˆط± ط¹ظ…ظ„ط¨ط§طھغŒ ط¯ط± ط±ظˆط²ظ‡ط§غŒ ع©ط§ط±غŒ
let firstSendDataToProductionForMini = new CronJob(
    // '30 4 22 * * sat,sun',
    '30 4 23 * * sat,sun',
    async function () {
        console.log('Send data for game-mini', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMini()
    },
    null,
    true,
    'Etc/UTC'
);
// ط§ط±ط³ط§ظ„ ط¯ط§ط¯ظ‡ ظ‡ط§ ط¨ظ‡ ط³ظ…طھ ط³ط±ظˆط± ط¹ظ…ظ„ط¨ط§طھغŒ ط¯ط± ط±ظˆط²ظ‡ط§غŒ ع©ط§ط±غŒ
let secondsendDataToProductionForMini = new CronJob(
    // '30 4 2 * * sat,tue,wed,thu,fri',
    '30 4 3 * * sat,tue,wed,thu,fri',
    async function () {
        console.log('Send data for game-mini', moment().format('jYYYY/jMM/jDD HH:mm:ss'))
        await nytController.sendDataToProductionForMini()
    },
    null,
    true,
    'Etc/UTC'
);
