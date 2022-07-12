const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const async = require('async');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');

class NytCrwalerService {
    constructor(inputDate) {
        this.date = inputDate
    }

    /**
     * Extract Links, Type, Text form https://nytminicrossword.com/nyt-mini-crossword/7-11-22
     * @param {*} this.date 7-11-22
     * @returns 
     */
    async getAllQuestionLinksFromHomePage() {
        try {
            console.log('------------------')
            console.log(this.date)
            console.log(`https://nytminicrossword.com/nyt-mini-crossword/${this.date}`)
            console.log('------------------');
            const url = `https://nytminicrossword.com/nyt-mini-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.nyt.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    date: this.date,
                    url: url,
                    status: statusService.START
                }
            });
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (!requestInfo.questions) {
                // ارسال درخواست به سایت
                const response = await axios({ method: 'get', url: url, headers: {} });
                // استخراج لینک و عنوان و نوع سوال
                const questions = this.extractQuestionLinks(response.data)
                // درج اطلاعات در دیتابیس که شامل سوالات هست
                await prisma.nyt.update({
                    where: { id: requestInfo.id },
                    data: {
                        questions: questions
                    },
                });
                return { id: requestInfo.id, date: this.date, questions, questions_answers: [] }
            }
            else {
                return { id: requestInfo.id, date: this.date, questions: requestInfo.questions, questions_answers: requestInfo.questions_answers }
            }
        } catch (error) {
            console.log(error)
        }
    }
    /**
     * 
     * @param {*} html 
     * @returns 
     */
    extractQuestionLinks(html) {
        let questions = [];
        let isDown = false;
        let $ = cheerio.load(html);
        $('.entry-content > div').each(function () {
            if ($(this).text().toLowerCase().trim() == 'down') {
                isDown = !isDown;
            }
            const link = $(this).find('.tips_block a').attr('href');
            const text = $(this).find('.tips_block a').text();
            if (link && link.includes('http')) {
                let obj = {
                    link: link,
                    text: text,
                    type: isDown ? 'down' : 'across'
                }
                questions.push(obj)
            }
        });
        return questions;
    }

    /**
     * دریافت جواب ها از همه لینک های سوال
     * @param {*} id 
     * @param {*} questions 
     * @returns 
     */
    async getAllAnswersFromQuestionLinks(id, date, questions) {
        const defer = q.defer();
        let answers = [];
        async.each(questions, async (question) => {
            try {
                let answer = await this.getAnswerByUrl(question.link);
                if (answer) {
                    question["answer"] = answer;
                    answers.push(question)
                }
            } catch (error) {
                await prisma.answers_error.create({
                    data: {
                        date: date,
                        url: question.link,
                        error: error.message,

                    }
                })
                console.log("--------------- ERROR in getAllAnswersFromQuestionLinks Start-------------------")
                console.log("getAllContentLink----> ", error)
                console.log("item", question)
                console.log("----------------------------------Error End-------------------------------------")
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

    async getAnswerByUrl(url) {
        const config = {
            method: 'get',
            url: url,
            headers: {}
        };
        const response = await axios(config)
        const $ = cheerio.load(response.data);
        const answer = $('div > ul > li').text()
        return answer;
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

}

module.exports = NytCrwalerService;