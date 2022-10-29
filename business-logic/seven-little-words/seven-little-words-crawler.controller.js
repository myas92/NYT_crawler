const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const SevenLittleWordsCrwalerService = require('./seven-little-words-crawler.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');

const crawlSevenLittleWordsAPI = async (req, res, next) => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Seven Little Words ** API --------------------')
        date = date ? date : moment().format('M-D-YY');
        let sevenLittleWords = new SevenLittleWordsCrwalerService(date);
        questionsAnswers = await sevenLittleWords.getQuestionAnswer()
        console.log('---------------------- Crawler ended for ** Seven Little Words **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlSevenLittleWords = async () => {
    try {
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Seven Little Words ** API --------------------')
        date = moment().format('M-D-YY');
        let sevenLittleWords = new SevenLittleWordsCrwalerService(date);
        questionsAnswers = await sevenLittleWords.getQuestionAnswer()
        console.log('---------------------- Crawler ended for ** Seven Little Words **  API--------------------')
    } catch (error) {
        console.log(error)
    }
}


// --------------------------------------------------------------------------------
// Extract Question and answers based on links


const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: Seven-letter-words: ${moment().format('M-D-YY')} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
        let { date } = req.params;
        date = date ? date : moment().format('M-D-YY');
        let result = await prisma.seven_little_words.findFirst({
            where: {
                date: date
            }
        })
        if (!result) {
            return res.status(404).json({ message: "There is no data for this date", result: [] })
        }
        return res.status(200).json({ message: "Request done successfully", data: date, result: result.questions_answers })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `Something went warong, plase try again later`,
            500
        );
        return next(errors);
    }
};


exports.crawlSevenLittleWordsAPI = crawlSevenLittleWordsAPI
exports.crawlSevenLittleWords = crawlSevenLittleWords
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI