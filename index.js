const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const async = require('async');
const q = require('q');
const prisma = require('./prisma/prisma-client');
const statusService = require('./config/constance/status');
// let job = new CronJob(
// 	'0 0 10 * * sat,sun,mon,tue,sat,fri',
// 	function() {
// 		console.log('You will see this message every second');
// 	},
// 	null,
// 	true,
// 	'Asia/Tehran'
// );
async function getAllLinks(today = moment().format('M-D-YY')) {
    try {

        let allLinks = [], linksAcross = [], linksDown = [];
        let isDown = false;
        console.log('------------------')
        console.log(today)
        console.log('------------------');
        const url = `https://nytminicrossword.com/nyt-mini-crossword/${today}`;
        const config = {
            method: 'get',
            url: url,
            headers: {}
        };
        let requestInfo = await prisma.nyt.upsert({
            where: {
                date: today,
            },
            update: {},
            create: {
                date: today,
                url: url,
                status: statusService.START
            }
        });
        let response = await axios(config)
        let $ = cheerio.load(response.data);
        $('.entry-content > div').each(function (index) {
            if ($(this).text().toLowerCase().trim() == 'down') {
                isDown = !isDown;
            }
            let link = $(this).find('.tips_block a').attr('href');
            let text = $(this).find('.tips_block a').text();
            if (link && link.includes('http')) {
                let obj = {
                    link: link,
                    text: text,
                    type: isDown ? 'down' : 'across'
                }
                if (isDown) {
                    linksDown.push(obj)
                } else {
                    linksAcross.push(obj)
                }
                allLinks.push(obj)
            }
        });
        await prisma.nyt.update({
            where: {
                id: requestInfo.id
            },
            data: {
                questions: allLinks
            },
        });
        return { id: requestInfo.id, linksAcross, linksDown, allLinks, }
    } catch (error) {
        console.log(error)
    }

}

async function getContentLink(url) {
    // #post-589284 > div > ul > li
    const config = {
        method: 'get',
        url: url,
        headers: {}
    };
    let response = await axios(config)
    let $ = cheerio.load(response.data);
    let res = $('div > ul > li').text()
    return res;
}

async function getAllContentLink(id, questionLinks) {
    let defer = q.defer()
    let answers = []
    async.each(questionLinks, async (questionLink) => {
        try {
            let answer = await getContentLink(questionLink.link);
            if (answer) {
                questionLink["answer"] = answer;
                answers.push(questionLink)
            }
        } catch (error) {
            console.log("getAllContentLink----> ", error)
            console.log("----------------------------------")
            console.log("item", questionLink)

        }

    }, async () => {
        await prisma.nyt.update({
            where: {
                id: id
            },
            data: {
                questions_answers: answers,
                status: statusService.FINISH
            },
        });
        defer.resolve(answers)
    })
    return defer.promise;
}

// getAllLinks()
// getContentLink()
// getAllContentLink()

async function nytService(date=null) {
    console.time("totalExecutionTime");
    let result = await getAllLinks(date)
    if (result) {
        await getAllContentLink(result.id, result.allLinks)
        console.timeLog("totalExecutionTime");
    }

}

// async function getArchive() {
//     let lastRequestInfo = await prisma.nyt.findFirst({
//         orderBy: {
//             date: 'asc'
//         },
//     })
//     const format = 'M-D-YY';
//     lastWeekDays = [];
//     for (let i=1; i < 8; i++){
//         let oldDate = moment(lastRequestInfo.date, format).subtract(i, 'days').format(format)
//         lastWeekDays.push(oldDate)
//     }


//     let defer = q.defer()
//     let answers = []
//     async.eachSeries(lastWeekDays, async (date) => {
//         try {
//             await nytService(date);
//         } catch (error) {
//             console.log("Archive ----> ", error)
//         }
//     }, async () => {
//         defer.resolve(answers)
//     })
//     return defer.promise;
// }

// nytService()

getArchive()