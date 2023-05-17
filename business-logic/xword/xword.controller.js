const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const axios = require('axios');
const XWordCrawlerService = require('./xword.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const { currentTehranDate, tommarowTehranDate } = require("../../utils/helper");
const momentTZ = require('moment-timezone');

const crawlMaxiAPI = async (req, res, next) => {
    try {
        let { date } = req?.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** xword-Maxi ** API --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new XWordCrawlerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMaxi();
        console.log('---------------------- Crawler ended for ** xword-Maxi **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlMaxi = async () => {
    try {
        let date = currentTehranDate();
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** xword-Maxi ** Cron --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new XWordCrawlerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMaxi();
        console.log('---------------------- Crawler ended for ** xword-Maxi **  Cron--------------------')
    } catch (error) {
        console.log(error)
    }
}

// --------------------------------- WordPress ----------------------------------------------


const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: get xword Data For Maxi API: ${moment().format('M-D-YY')} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
        let { date } = req.query;
        let { category } = req.query;
        let statusCode = 404
        let message = "Please try again later";
        let result = []
        date = date ? date : currentTehranDate();
        let title_date = date ? moment(date, 'MM-DD-YY').format('YYYY-MM-DD') : momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
        let fullDateFormat = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        let resultMaxi;
        let qa_id = '';
        message = "Request done successfully";

        resultMaxi = await prisma.xword_maxi.findFirst({
            where: {
                date: date
            }
        })
        if (resultMaxi) {
            if (category == 'NYT-Maxi') {
                result = [...resultMaxi.questions_answers];
                qa_id = resultMaxi.qa_id

            }
            message = "Request done successfully";
            statusCode = 200;
        }
        return res.status(statusCode).json({ message: message, qa_id: qa_id, category, title_date, date: fullDateFormat, result })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `Something went wrong, please try again later`,
            500
        );
        return next(errors);
    }
};
exports.crawlMaxiAPI = crawlMaxiAPI
exports.crawlMaxi = crawlMaxi
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI