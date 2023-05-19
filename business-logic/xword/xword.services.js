const cheerio = require('cheerio');
const moment = require('moment-jalaali');
const axios = require('axios');
const q = require('q');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
const { randomBytes } = require('crypto');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class XWordCrawlerService {
    constructor(inputDate) {
        this.date = inputDate
        // this.date = '5/17/2023'
    }
    /**
     * Extract Links, Type, Text form https://dailythemedcrossword.info/regular-7-march-2023-crossword/
     * @param {*} this.date 5/17/2023
     * @returns 
     */
    async getQuestionAnswerForMaxi() {
        try {
            let date = moment(this.date, 'M-D-YY').format('M/D/YYYY') // 5/17/2023
            console.log("xword-maxi: ", this.date)
            console.log(`https://www.xwordinfo.com/JSON/TrackData.ashx?date=${date}`)

            const url = `https://www.xwordinfo.com/JSON/TrackData.ashx?date=${date}`;
            // // درج اطلاعات اولیه درخواست 
            let requestInfo = await prisma.xword_maxi.upsert({
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
            if (requestInfo.questions_answers == null || JSON.stringify(requestInfo.questions_answers) === '{}' || requestInfo.questions_answers?.length == 0) {
                //     // ارسال درخواست به سایت
                let response = await axios({
                    method: 'get', url: url, headers: {

                        'Content-Type': 'application/json',
                        'referer': url,

                    }, timeout: 2 * 60 * 1000
                });
                // responseMaxiCross = fs.readFileSync('/home/yaser/Desktop/new-times/maxi/maxi.html','utf-8')
                // استخراج لینک و عنوان و نوع سوال
                //fs.writeFileSync(`./body/DL_Maxi_${+new Date()}.html`, response.data)
                const questionsAnswers = await this.extractQuestionsAnswers(response.data);
                if (questionsAnswers) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await prisma.xword_maxi.update({
                        where: { id: requestInfo.id },
                        data: {
                            questions_answers: questionsAnswers,
                            status: statusService.FINISH
                        },
                    });

                }
                return { questionsAnswers: questionsAnswers, message: 'done' }
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
    async extractQuestionsAnswers(data) {
        let across = await this.processData({ data: data.Across, type: 'across' })
        let down = await this.processData({ data: data.Down, type: 'down' })
        return [...across, ...down]
    }

    async  processData({ data, type }) {
        let result = []
        for (const item of data) {
            let {groups} = item.match(/:\s(?<question>.*)\s:\s<b>(?<answer>.*)<\/b>/)
            groups.question = await this.convertHTMLtoStr(groups.question);
            groups.answer = await this.convertHTMLtoStr(groups.answer);
            groups.type = type;
            groups.category = 'maxi-cross';
            result.push(groups)
        }
        return result;
    }
    
    async convertHTMLtoStr(input) {
        let $ = await cheerio.load(input);
        return $.text();
    }
    
}

module.exports = XWordCrawlerService