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
        // this.date = '7-20-22'
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
            // // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (requestInfo.questions_answers == null || requestInfo.questions_answers?.length == 0) {
            //     // ارسال درخواست به سایت
                let response = await axios({ method: 'get', url: url, headers: {}, timeout: 2 * 60 * 1000 });
                // responseMaxiCross = fs.readFileSync('/home/yaser/Desktop/new-times/maxi/maxi.html','utf-8')
                // استخراج لینک و عنوان و نوع سوال

                const questionsAnswers = this.extractQuestionsAnswers(response.data, "maxi-cross");
                if (questionsAnswers) {
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

    /**
 * 
 * @param {*} html 
 * @returns 
 */
    extractQuestionsAnswers(html,category) {
        let down = [];
        let across = [];
        let $ = cheerio.load(html);
        $('body > div.container > div > p').each(function (index, item) {
            const question  = $(this).text();
            const regex = /\d*(a|d)\.\s(.*)\:$/gm;
            let processedText = regex.exec(question);
            let type = processedText[1]=='d' ? 'down' : 'across'
 
            let obj = {
                type: type,
                answer: $(this).next().text(),
                category: category,
                question: processedText[2]
            }
            if(obj.type=='down'){
                down.push(obj)
            }
            else{
                across.push(obj)
            }
        });
        return [...across,...down]
    }

}

module.exports = DailyThemeCrwalerService