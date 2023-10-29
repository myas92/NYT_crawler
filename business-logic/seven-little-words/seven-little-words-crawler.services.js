const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const async = require('async');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
const { del } = require('q');
const { randomBytes } = require('crypto');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class SevenLittleWordsCrwalerService {
    constructor(inputDate) {
        this.date = inputDate
        // this.date = '7-20-22'
    }
    /**
     * Extract Links, Type, Text form https://7littlewords.us/daily-puzzle-answers/?date=${date}
     * @param {*} this.date 7-11-22
     * @returns 
     */
    async getQuestionAnswer() {
        try {
            let date = moment(this.date, 'M-D-YY').format('D-MMMM-YYYY')
            const DateValidation = moment(this.date, 'M-D-YY').format('MMMM D YYYY').toLowerCase()
            const validation = `7 little words ${DateValidation} daily puzzle answers`
            console.log("Seven Little Words: ", this.date)
            console.log(`https://7littlewords.us/daily-puzzle-answers/${date}-answers`)

            const url = `https://7littlewords.us/daily-puzzle-answers/${date}-answers`;
            // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.seven_little_words.upsert({
                where: { date: this.date },
                update: {},
                create: {
                    qa_id: randomBytes(5).toString('hex'),
                    date: this.date,
                    url: url,
                    status: statusService.START
                }
            });
            // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || requestInfo.questions_answers?.length == 0) {
                // ارسال درخواست به سایت
                let response;
                response = await axios({ method: 'get', url: url, headers: {} });
                // responseMiniCross = fs.readFileSync('/home/yaser/Desktop/new-times/mini/mini.html','utf-8')
                let isValidContent = this.isValidContent(response.data, validation);
                if (!isValidContent) {
                    throw new Error('Content is not valid for *** seven little words ***')
                }
                // استخراج لینک و عنوان و نوع سوال

                const questionsAnswers = this.extractQuestionsAnswers(response.data, "mini-cross");
                if (questionsAnswers) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.seven_little_words.update({
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
    extractQuestionsAnswers(html) {
        let isDown = false;
        let isAnswer = false;
        let result = [];
        let bunos = 0;
        let $ = cheerio.load(html);
        $('#container > div > table > tbody > tr').each(function (index, item) {
            let question = $(this).find('td:nth-child(1)').text()
            if (index != 0 && question == 'Clue') {
                bunos = bunos + 1
            }
            if (index > 0 && question != 'Clue') {
                let row = {}
                row["question"] = question
                row["numLetters"] = $(this).find('td:nth-child(2)').text().split(' ')[0];
                row["answer"] = $(this).find('td:nth-child(2)').attr('onclick').split('\'')[3];
                row["bunos"] = bunos
                result.push(row)
            }

        });

        return result
    }

    isValidContent(html, validation) {
        let isValid = false;
        let $ = cheerio.load(html);
        let content = $('#container > div > h1').text().toLowerCase()
        if (content == validation) {
            isValid = true
        }
        return isValid
    }



}

module.exports = SevenLittleWordsCrwalerService