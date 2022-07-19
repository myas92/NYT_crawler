const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const async = require('async');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
class NytCrwalerService {
    constructor(inputDate) {
        this.date = inputDate
        // this.date = '7-20-22'
    }
    /**
     * Extract Links, Type, Text form https://nytminicrossword.com/nyt-mini-crossword/7-11-22
     * @param {*} this.date 7-11-22
     * @returns 
     */
    async getAllQuestionAnswers() {
        try {
            let questionsAnswers = []
            console.log(this.date)
            console.log(`https://nytminicrossword.com/nyt-mini-crossword/${this.date}`)
            console.log(`https://nytminicrossword.com/nyt-crossword/${this.date}`)

            const urlMiniCross = `https://nytminicrossword.com/nyt-mini-crossword/${this.date}`;
            const urlMaxiCross = `https://nytminicrossword.com/nyt-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.main_nyt.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    date: this.date,
                    url_mini_cross: urlMiniCross,
                    url_maxi_cross: urlMaxiCross,
                    status: statusService.START
                }
            });
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || requestInfo.questions_answers?.length == 0) {
                // ارسال درخواست به سایت
                const responseMaxiCross = await axios({ method: 'get', url: urlMaxiCross, headers: {} });
                const responseMiniCross = await axios({ method: 'get', url: urlMiniCross, headers: {} });
                // استخراج لینک و عنوان و نوع سوال
                console.log('---------------------MINI---------------------------------');
                console.log('---------------------MINI---------------------------------');
                console.log('---------------------MINI---------------------------------');
                console.log('---------------------MINI---------------------------------');
                console.log(responseMiniCross.data)
                console.log('**********************MINI*************************************');
                console.log('**********************MINI*************************************');
                console.log('---------------------MAXI---------------------------------');
                console.log('---------------------MAXI---------------------------------');
                console.log('---------------------MAXI---------------------------------');
                console.log('---------------------MAXI---------------------------------');
                console.log(responseMaxiCross.data)
                console.log('***********************************************************');

                const questionsAnswersMiniCross = this.extractQuestionsAnswers(responseMiniCross.data, "mini-cross");
                const questionsAnswersMaxiCross = this.extractQuestionsAnswers(responseMaxiCross.data, "maxi-cross");
                if (questionsAnswersMiniCross && questionsAnswersMaxiCross) {
                    let questionsAnswers = [...questionsAnswersMiniCross, ...questionsAnswersMaxiCross]
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.main_nyt.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswers
                        },
                    });

                }
                return questionsAnswers
            }
            return requestInfo.questions_answers
        } catch (error) {
            console.log(error)
        }
    }

    /**
 * 
 * @param {*} html 
 * @returns 
 */
    extractQuestionsAnswers(html, category) {
        let result = [];
        let isDown = false;
        let isAnswer = false;
        let $ = cheerio.load(html);
        $('.entry-content > div').each(function () {
            if ($(this).text().toLowerCase().trim() == 'down') {
                isDown = !isDown;
            }
            if ($(this).attr('class') == 'tips_block') {
                const question = $(this).text();
                let obj = {
                    question: question,
                    type: isDown ? 'down' : 'across',
                    category
                }
                result.push(obj)
            }

        });
        $('.entry-content > ul').each(function (index, item) {
            isAnswer = true;
            if ($(this).text().toLowerCase().trim() == 'down') {
                isDown = !isDown;
            }
            const answer = $(this).text();
            result[index]["answer"] = answer
        });
        return isAnswer ? result : null;
    }

    // ---------------------------------------------------------------------------------------------------------
    // Extract based on links

    async getAllQuestionLinksFromHomePage() {
        try {
            console.log(this.date)
            console.log(`https://nytminicrossword.com/nyt-mini-crossword/${this.date}`)

            const urlMiniCross = `https://nytminicrossword.com/nyt-mini-crossword/${this.date}`;
            const urlMaxiCross = `https://nytminicrossword.com/nyt-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.nyt.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    date: this.date,
                    url_mini_cross: urlMiniCross,
                    url_maxi_cross: urlMaxiCross,
                    status: statusService.START
                }
            });
            let updateDate = moment(requestInfo.updatedAt).add(5, 'm').format('YYYY-MM-DD HH:mm:ss');
            let currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            if (updateDate < currentDate) {
                await prisma.nyt.update({
                    where: { id: requestInfo.id },
                    data: {
                        status: statusService.START,
                        updatedAt: new Date()
                    }
                });
            }
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions == null || requestInfo.questions?.length == 0) {
                // ارسال درخواست به سایت
                const responseMiniCross = await axios({ method: 'get', url: urlMiniCross, headers: {} });
                const responseMaxiCross = await axios({ method: 'get', url: urlMaxiCross, headers: {} });
                // استخراج لینک و عنوان و نوع سوال
                const questionsMiniCross = this.extractQuestionLinks(responseMiniCross.data, "mini-cross");
                const questionsMaxiCross = this.extractQuestionLinks(responseMaxiCross.data, "maxi-cross");
                let questions = [...questionsMiniCross, ...questionsMaxiCross]
                // درج اطلاعات در دیتابیس که شامل سوالات هست
                await prisma.nyt.update({
                    where: { id: requestInfo.id },
                    data: {
                        questions: questions
                    },
                });
                return { id: requestInfo.id, date: this.date, questions, questions_answers: null }
            }
            return { id: requestInfo.id, date: this.date, questions: requestInfo.questions, questions_answers: requestInfo.questions_answers }

        } catch (error) {
            console.log(error)
        }
    }

    /**
     * 
     * @param {*} html 
     * @returns 
     */
    extractQuestionLinks(html, category) {
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
                    question: text,
                    type: isDown ? 'down' : 'across',
                    category
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
        await prisma.nyt.update({
            where: { id: id },
            data: {
                status: statusService.RUNNING
            }
        })
        async.eachSeries(questions, async (question) => {
            try {
                let answer = await this.getAnswerByUrl(question.link);
                console.log(answer)
                if (answer) {
                    question["answer"] = answer;
                    delete question.link
                    answers.push(question)
                }
            } catch (error) {
                question["answer"] = '';
                answers.push(question)
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
            headers: {},
            timeout: 4000
        };
        const response = await axios(config)
        const $ = cheerio.load(response.data);
        const answer = $('div > ul > li').text()
        return answer;
    }

}

module.exports = NytCrwalerService;