const moment = require('moment-jalaali');
const axios = require('axios');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const fs = require('fs');
const { randomBytes } = require('crypto');
const { isEmpty } = require('../../utils/helper');
const { finishCrawling, insertStartCrawling } = require('../../utils/query');

class NytimesCrawlerService {
    constructor(inputDate) {
        this.date = inputDate
    }
    /**
     * Extract data from this website https://www.nytimes.com/crosswords/game/mini/2023/10/07
     * Extract api https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/2023-10-13.json
     * @param {*} this.date 5/17/2023
     * @returns 
     */
    async crawlQuestionAnswerForMini() {
        try {
            const TABLE = 'nytimes_mini', CATEGORY = 'mini-cross';
            let date = moment(this.date, 'M-D-YY').format('YYYY-MM-DD') // 2023-10-07
            console.log("nytimes.com-mini: ", this.date)
            const url = `https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/${date}.json`;
            console.log(url)

            // // درج اطلاعات اولیه درخواست 
            let requestInfo = await insertStartCrawling(TABLE, this.date, url)

            // // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (isEmpty(requestInfo.questions_answers)) {
                //     // ارسال درخواست به سایت
                let response = await axios({
                    method: 'get', url: url, headers: {

                        'Content-Type': 'application/json',
                        'referer': url,
                        'cookie': process.env.COOKIES_NYTIMES

                    }, timeout: 2 * 60 * 1000
                });

                const questionsAnswers = await this.extractQuestionsAnswers({ data: response.data, category: CATEGORY });
                let board = response.data?.body[0]?.board // اطلاعات جدول
                if (questionsAnswers) {
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await finishCrawling(TABLE, requestInfo.id, questionsAnswers, board)
                }
                return { questionsAnswers: questionsAnswers, board: board, message: 'done' }
            }
            return { questionsAnswers: requestInfo.questions_answers, board: requestInfo.board, message: '' }
        } catch (error) {
            console.log(error)
        }
    }
    /**
     * Extract data from this website https://www.nytimes.com/crosswords/game/daily/2023/10/07
     * Extract api https://www.nytimes.com/svc/crosswords/v6/puzzle/daily/2023/10/07.json
     * @param {*} this.date 5/17/2023
     * @returns 
     */
    async crawlQuestionAnswerForMaxi() {
        try {
            let date = moment(this.date, 'M-D-YY').format('YYYY-MM-DD') // 2023-10-07
            console.log("nytimes.com-maxi: ", this.date)
            const url = `https://www.nytimes.com/svc/crosswords/v6/puzzle/daily/${date}.json`;
            console.log(url)

            // // درج اطلاعات اولیه درخواست 
            let requestInfo = await insertStartCrawling('nytimes_maxi', this.date, url)

            // // اگر سوالات برای این روز وجود نداشت مجددا دریافت شود
            if (isEmpty(requestInfo.questions_answers)) {
                //     // ارسال درخواست به سایت
                let response = await axios({
                    method: 'get', url: url, headers: {

                        'Content-Type': 'application/json',
                        'referer': url,
                        'cookie': process.env.COOKIES_NYTIMES

                    }, timeout: 2 * 60 * 1000
                });

                const questionsAnswers = await this.extractQuestionsAnswers({ data: response.data, category: "maxi-cross" });
                let board = response.data?.body[0]?.board
                if (questionsAnswers) {
                   
                    // درج اطلاعات در دیتابیس که شامل سوالات هست
                    await finishCrawling('nytimes_maxi', requestInfo.id, questionsAnswers, board)
                }
                return { questionsAnswers: questionsAnswers, board: board, message: 'done' }
            }
            return { questionsAnswers: requestInfo.questions_answers, board: requestInfo.board, message: '' }
        } catch (error) {
            console.log(error)
        }
    }


    async extractQuestionsAnswers({ data, category }) {
        let questions = data.body[0].clues;
        let answers = data.body[0].cells;
        let questionsAnswers = []
        questions.forEach(question => {
            let answer = this.extractAnswers(answers, question.cells);
            questionsAnswers.push({
                question: question.text[0].plain,
                answer: answer,
                type: question.direction.toLowerCase(),
                category: category

            })
        });
        return questionsAnswers
    }

    extractAnswers(answers, answerCells) {
        let foundedItem = []
        answerCells.forEach(cell => {
            foundedItem.push(answers[cell].answer)
        })
        return foundedItem.join('')
    }
}

module.exports = NytimesCrawlerService