const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
const { randomBytes } = require('crypto');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class DailyThemeCrwalerService {
    constructor(inputDate) {
        this.date = inputDate
        // this.date = '5-5-22'
    }
    /**
     * Extract Links, Type, Text form https://dailythemedcrossword.info/regular-7-march-2023-crossword/
     * @param {*} this.date 7-11-22
     * @returns 
     */
    async getQuestionAnswerForMaxi() {
        try {
            let date = moment(this.date, 'M-D-YY').format('D-MMMM-YYYY')
            console.log("Daily Theme: ", this.date)
            console.log(`https://dailythemedcrossword.info/regular-${date}-crossword/`)

            const url = `https://dailythemedcrossword.info/regular-${date}-crossword/`;
            // // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.daily_theme_maxi.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    qa_id: randomBytes(5).toString('hex'),
                    date: this.date,
                    url: url,
                    status: statusService.START
                }
            });
            let questionsAnswers =[]
            // // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || JSON.stringify(requestInfo.questions_answers) === '{}' || requestInfo.questions_answers?.length == 0) {
                let requestNumber = new Array(5).fill(0)
                for (let [index, request] of requestNumber.entries()) {
                    try {
                        // ارسال درخواست به سایت
                        let response = await axios({ method: 'get', url: url, headers: {}, timeout: 2 * 60 * 1000 });
                        // responseMaxiCross = fs.readFileSync('/home/yaser/Desktop/new-times/maxi/maxi.html','utf-8')
                        // استخراج لینک و عنوان و نوع سوال
                        //fs.writeFileSync(`./body/DL_Maxi_${+new Date()}.html`, response.data)
                        questionsAnswers = await this.extractQuestionsAnswers(response.data, "maxi-cross");
                    }
                    catch {

                    }
                }
                if (questionsAnswers?.length > 1) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.daily_theme_maxi.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswers,
                            status: statusService.FINISH
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

    async getQuestionAnswerForMini() {
        try {
            let date = moment(this.date, 'M-D-YY').format('D-MMMM-YYYY')
            console.log("Daily Theme: ", this.date)
            console.log(`https://dailythemedcrossword.info/mini-${date}-crossword/`)

            const url = `https://dailythemedcrossword.info/mini-${date}-crossword/`;
            // // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.daily_theme_mini.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    qa_id: randomBytes(5).toString('hex'),
                    date: this.date,
                    url: url,
                    status: statusService.START
                }
            });
            let questionsAnswers = [];
            // // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || JSON.stringify(requestInfo.questions_answers) === '{}' || requestInfo.questions_answers?.length == 0) {
                let requestNumber = new Array(5).fill(0)
                for (let [index, request] of requestNumber.entries()) {
                    try {
                        // ارسال درخواست به سایت
                        let response = await axios({ method: 'get', url: url, headers: {}, timeout: 2 * 60 * 1000 });
                        // responseMaxiCross = fs.readFileSync('/home/yaser/Desktop/new-times/maxi/maxi.html','utf-8')
                        // استخراج لینک و عنوان و نوع سوال

                        questionsAnswers = await this.extractQuestionsAnswers(response.data, "mini-cross");
                        if (questionsAnswers.length > 1) {
                            break;
                        }
                    } catch (error) {
                        await delay(3000)
                    }

                }
                if (questionsAnswers?.length > 1) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.daily_theme_mini.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswers,
                            status: statusService.FINISH
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
    async extractQuestionsAnswers(html, category) {
        let down = [];
        let across = [];
        let $ = await cheerio.load(html);
        $('body > div.container > div > p').each(function (index, item) {
            try {
                let regex = /\d*(a|d)\.\s(.*)\:$/gm;
                let question = $(this).text();
                let processedText = regex.exec(question);
                let type = processedText[1] == 'd' ? 'down' : 'across'
                let answer = $(this).next().find('.le').text();
                answer = answer == '' ? $(this).next().next().find('.le').text() : answer;
                let questionFinal = processedText[2].replaceAll("\"", '')
                let obj = {
                    type: type,
                    answer: answer,
                    category: category,
                    question: questionFinal
                }
                if (obj.type == 'down') {
                    down.push(obj)
                }
                else {
                    across.push(obj)
                }
            } catch (error) {
                console.log('error in Process Daily Theme', error)
            }

        });
        return [...across, ...down]
    }

}

module.exports = DailyThemeCrwalerService