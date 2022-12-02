const CronJob = require('cron').CronJob;
const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const async = require('async');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
const { del } = require('q');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const { randomBytes } = require('crypto');
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
    async getAllQuestionAnswersForMini() {
        try {
            console.log("Mini: ", this.date)
            console.log(`https://nytminicrossword.com/nyt-mini-crossword/${this.date}`)

            const urlMiniCross = `https://nytminicrossword.com/nyt-mini-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.nyt_mini.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    qa_id: randomBytes(5).toString('hex'),
                    date: this.date,
                    url_mini_cross: urlMiniCross,
                    status: statusService.START
                }
            });
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || requestInfo.questions_answers?.length == 0) {
                // ارسال درخواست به سایت
                let responseMiniCross;
                let isValidMiniContent;
                let requestNumber = new Array(12).fill(0);
                for (let request of requestNumber) {
                    responseMiniCross = await axios({ method: 'get', url: urlMiniCross, headers: {} });
                    fs.writeFileSync(`./body/mini_${+new Date()}.html`, responseMiniCross.data)
                    // responseMiniCross = fs.readFileSync('/home/yaser/Desktop/new-times/mini/mini.html','utf-8')
                    isValidMiniContent = this.isValidContent(responseMiniCross.data, 'nyt mini crossword answers');
                    if (isValidMiniContent)
                        break;
                    await delay(2000)
                }
                if (!isValidMiniContent) {
                    throw new Error('Content is not valid for [Mini] in title')
                }

                // استخراج لینک و عنوان و نوع سوال

                const questionsAnswersMiniCross = this.extractQuestionsAnswers(responseMiniCross.data, "mini-cross");
                if (questionsAnswersMiniCross && questionsAnswersMiniCross?.length < 30) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.nyt_mini.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswersMiniCross,
                            status: statusService.FINISH
                        },
                    });
                    return { questionsAnswers: questionsAnswersMiniCross, message: 'done' }

                }
                else {
                    throw new Error('Content is not valid for [Mini] in length')
                }
            }
            return { questionsAnswers: requestInfo.questions_answers, message: '' }
        } catch (error) {
            console.log(error)
        }
    }
    async getAllQuestionAnswersForMaxi() {
        try {
            console.log("Maxi: ", this.date)
            console.log(`https://nytminicrossword.com/nyt-crossword/${this.date}`)

            const urlMaxiCross = `https://nytminicrossword.com/nyt-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.nyt_maxi.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    qa_id: randomBytes(5).toString('hex'),
                    date: this.date,
                    url_maxi_cross: urlMaxiCross,
                    status: statusService.START
                }
            });
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || requestInfo.questions_answers?.length == 0) {
                // ارسال درخواست به سایت
                let responseMaxiCross;
                let isValidMaxiContent
                let requestNumber = new Array(5).fill(0)
                for (let request of requestNumber) {
                    responseMaxiCross = await axios({ method: 'get', url: urlMaxiCross, headers: {} });
                    // responseMaxiCross = fs.readFileSync('/home/yaser/Desktop/nyt/maxi.html', 'utf-8')
                    fs.writeFileSync(`./body/maxi_${+new Date()}.html`, responseMaxiCross.data)
                    isValidMaxiContent = this.isValidContent(responseMaxiCross.data, 'nyt crossword answers')
                    if (isValidMaxiContent)
                        break;
                    await delay(5000)
                }
                if (!isValidMaxiContent) {
                    throw new Error('Content is not valid for [Maxi] in title')
                }
                // استخراج لینک و عنوان و نوع سوال
                const questionsAnswersMaxiCross = this.extractQuestionsAnswers(responseMaxiCross.data, "maxi-cross");
                if (questionsAnswersMaxiCross && questionsAnswersMaxiCross?.length > 30) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.nyt_maxi.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswersMaxiCross,
                            status: statusService.FINISH
                        },
                    });
                    return { questionsAnswers: questionsAnswersMaxiCross, message: 'done' }
                }
                else {
                    throw new Error('Content is not valid for [Maxi] in length')
                }
                
          
            }
            return { questionsAnswers: requestInfo.questions_answers, message: '' }
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

    isValidContent(html, title) {
        let isValid = false;
        let questions = [];
        let $ = cheerio.load(html);
        let content = $('.entry-content > p:nth-child(7) > a').text().toLowerCase();
        $('.entry-content > div').each(function () {
            const link = $(this).find('.tips_block a').attr('href');
            if (link && link.includes('http')) {
                let obj = {
                    link: link,
                }
                questions.push(obj)
            }
        });
        if (title == content && questions.length == 0) {
            isValid = true
        }
        if (questions.length > 0) {
            console.log("^^^^^^^^^^^^^^^^^   I found Question link :( ^^^^^^^^^^^^^^^^^^^^")
        }
        return isValid
    }

    // ---------------------------------------------------------------------------------------------------------
    // Extract based on links

    async getAllQuestionLinksFromHomePage() {
        try {
            console.log(this.date)
            console.log(`https://nytminicrossword.com/nyt-mini-crossword/${this.date}`)

            const urlMiniCross = `https://nytminicrossword.com/nyt-mini-crossword/${this.date}`;
            // const urlMaxiCross = `https://nytminicrossword.com/nyt-crossword/${this.date}`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.nyt.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    date: this.date,
                    url_mini_cross: urlMiniCross,
                    // url_maxi_cross: urlMaxiCross,
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
            // if (requestInfo.questions == null || requestInfo.questions?.length == 0) {
            // ارسال درخواست به سایت
            const responseMiniCross = await axios({ method: 'get', url: urlMiniCross, headers: {} });
            // const responseMaxiCross = await axios({ method: 'get', url: urlMaxiCross, headers: {} });
            // استخراج لینک و عنوان و نوع سوال
            const questionsMiniCross = this.extractQuestionLinks(responseMiniCross.data, "mini-cross");
            // const questionsMaxiCross = this.extractQuestionLinks(responseMaxiCross.data, "maxi-cross");
            // let questions = [...questionsMiniCross, ...questionsMaxiCross]
            // درج اطلاعات در دیتابیس که شامل سوالات هست
            await prisma.nyt.update({
                where: { id: requestInfo.id },
                data: {
                    questions: questionsMiniCross
                },
            });
            return { id: requestInfo.id, date: this.date, questions: questionsMiniCross, url: urlMiniCross }
            // }

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
    async getAllAnswersFromQuestionLinks(id, date, questions, url) {
        const defer = q.defer();
        let answers = [];
        await prisma.nyt.update({
            where: { id: id },
            data: {
                status: statusService.RUNNING
            }
        })
        let result = [];
        async.eachSeries(questions, async (question) => {
            try {
                let answer = await this.getAnswerByUrl(question.link);
                if (answer) {
                    let obj = {
                        type: question.type,
                        answer: answer,
                        category: question.category,
                        question: question.question
                    }
                    result.push(obj)

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
            await prisma.nyt_mini.upsert({
                where: {
                    date: date
                },
                update: {
                    questions_answers: result,
                },
                create: {
                    date: date,
                    url_mini_cross: url,
                    questions_answers: result,
                    status: statusService.FINISH
                },
            });
            defer.resolve(result)
        })
        return defer.promise;
    }
    /**
     * دریافت جواب ها از همه لینک های سوال
     * @param {*} id 
     * @param {*} questions 
     * @returns 
     */
    async getAllAnswersFromQuestionLinksForCheck(id, date, questions, url) {
        const defer = q.defer();

        let result = [];
        async.eachSeries(questions, async (question) => {
            try {
                let answer = await this.getAnswerByUrl(question.link);
                if (answer) {
                    let obj = {
                        type: question.type,
                        answer: answer,
                        category: question.category,
                        question: question.question
                    }
                    result.push(obj)

                }
            } catch (error) {
                console.log("--------------- ERROR in getAllAnswersFromQuestionLinks Start-------------------")
                console.log("getAllContentLink----> ", error)
                console.log("item", question)
                console.log("----------------------------------Error End-------------------------------------")
            }
        }, async () => {
            defer.resolve(result)
        })
        return defer.promise;
    }

    async getAnswerByUrl(url) {
        const config = {
            method: 'get',
            url: url,
            headers: {},
            timeout: 10000
        };
        const response = await axios(config)
        const $ = cheerio.load(response.data);
        const answer = $('div > ul > li').text()
        return answer;
    }

}

module.exports = NytCrwalerService;