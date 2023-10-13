const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const axios = require('axios');
const NytimesCrawlerService = require('./nytimes.services')
const prisma = require('../../prisma/prisma-client');
const { currentTehranDate, getTitleDate, getFullDateFormat, isEmpty } = require("../../utils/helper");
const momentTZ = require('moment-timezone');
const { findByDate, saveResponseWordpress } = require("../../utils/query");
const { getConfigWP } = require("../../utils/config.wp");
const { outputModel } = require("../../utils/output.model");

const crawlMiniAPI = async (req, res, next) => {
    try {
        let { date } = req?.query
        let questionsAnswers;
        console.log('---------------------- 1: Crawler started for ** nytimes.com-Mini ** API --------------------')
        date = date ? date : currentTehranDate();
        let nytimesResult = new NytimesCrawlerService(date);
        questionsAnswers = await nytimesResult.crawlQuestionAnswerForMini();
        console.log('---------------------- 2: Crawler ended for ** nytimes.com-Mini **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlMini = async () => {
    try {
        let date = currentTehranDate();
        console.log('---------------------- 1: Crawler started for ** nytimes.com-Mini ** Cron --------------------')
        date = date ? date : currentTehranDate();
        let nytimesResult = new NytimesCrawlerService(date);
        const { message } = await nytimesResult.crawlQuestionAnswerForMini();
        if (message == 'done') {
            console.log(" ************** 2: Got nytimes.com Mini---> Send Data to WP ************** ")
            await sendDataToProductionForMini()
        }
        console.log('---------------------- 3: Crawler ended for ** nytimes-Mini **  Cron--------------------')
    } catch (error) {
        console.log(error)
    }
}
//*******************Start Maxi ********************** */

const crawlMaxiAPI = async (req, res, next) => {
    try {
        let { date } = req?.query
        let questionsAnswers;
        console.log('---------------------- 1: Crawler started for ** nytimes-Maxi ** API --------------------')
        date = date ? date : currentTehranDate();
        let nytimesResult = new NytimesCrawlerService(date);
        questionsAnswers = await nytimesResult.crawlQuestionAnswerForMaxi();
        console.log('---------------------- 2: Crawler ended for ** nytimes-Maxi **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlMaxi = async () => {
    try {
        let date = currentTehranDate();
        console.log('---------------------- 1: Crawler started for ** nytimes.com-Maxi ** Cron --------------------')
        date = date ? date : currentTehranDate();
        let nytimesResult = new NytimesCrawlerService(date);
        const { message } = await nytimesResult.crawlQuestionAnswerForMaxi();
        if (message == 'done') {
            console.log(" ************** 2: Got nytimes.com maxi---> Send Data to WP ************** ")
            await sendDataToProductionForMaxi()
        }
        console.log('---------------------- 3: Crawler ended for ** nytimes.com-Maxi **  Cron--------------------')
    } catch (error) {
        console.log(error)
    }
}

// --------------------------------- WordPress ----------------------------------------------


const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: getQuestionsAnswerAPI For nytimes.com: ${moment().format('M-D-YY')} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
        let { date, category } = req.query;
        date = date ? date : currentTehranDate();
        let result = [];
        let title_date = getTitleDate(date);
        let fullDateFormat = getFullDateFormat();
        if (!category) {
            return res.status(404).json({ message: "Please enter category [NYT-Mini/NYT-Maxi]" })
        }
        if (category == 'NYT-Mini') {
            result = await findByDate('nytimes_mini', date)
        }
        if (category == 'NYT-Maxi') {
            result = await findByDate('nytimes_maxi', date)
        }
        if (isEmpty(result)) {
            return res.status(404).json({ message: "There is no data for this date", qa_id: '', title_date, date: fullDateFormat, category, result: [] })
        }

        return res.status(200).json({ message: "Request done successfully", qa_id: result.qa_id, category, title_date, date: fullDateFormat, result: [...result.questions_answers], board: result.board })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `Something went wrong, please try again later`,
            500
        );
        return next(errors);
    }
};


const sendDataToProductionForMini = async (req, res) => {
    let response;
    const TABLE = 'nytimes_mini', CATEGORY = 'NYT-Mini';
    const date = currentTehranDate();
    let titleDate = getTitleDate(date);
    let fullDateFormat = getFullDateFormat()
    let result = await findByDate(TABLE, date)

    if (!isEmpty(result)) {
        const body = JSON.stringify(outputModel(result.qa_id, CATEGORY, titleDate, fullDateFormat, result.questions_answers, result.board))
        const config = getConfigWP(process.env.SPEEADREADINGS_URL_MINI, CATEGORY, body);
        try {

            response = await axios(config);
            console.log("Sent Data to Wordpress Successfully [--nytimes.com-Mini--]:\n", response?.data)
        } catch (error) {
            console.error("Error Sending Data to Wordpress [--nytimes.com-Mini--]:\n", error?.message)
            await saveResponseWordpress('response_info', result.qa_id, CATEGORY, result.date, error.message)
            if (res) {
                return res.status(500).send({ message: 'Error in sending nytimes.com Mini data to wordpress server' })
            }
        }
    }
    if (res) {
        res.send({ message: 'Request done successfully for nytimes.com Maxi' })
    }
}
const sendDataToProductionForMaxi = async (req, res) => {
    const TABLE = 'nytimes_maxi', CATEGORY = 'NYT-Maxi';
    let response;
    const date = currentTehranDate();
    let titleDate = getTitleDate(date);
    let fullDateFormat = getFullDateFormat(5)// -5 minutes for maxi
    let result = await findByDate(TABLE, date)

    if (!isEmpty(result)) {
        const body = JSON.stringify(outputModel(result.qa_id, CATEGORY, titleDate, fullDateFormat, result.questions_answers, result.board ))
        const config = getConfigWP(process.env.SPEEADREADINGS_URL_MAXI, CATEGORY, body);
        try {

            response = await axios(config);
            console.log("Sent Data to Wordpress Successfully [--nytimes.com-Maxi--]:\n", response?.data)
        } catch (error) {
            console.error("Error Sending Data to Wordpress [--nytimes.com-Maxi--]:\n", error?.message)
            await saveResponseWordpress('response_info', result.qa_id, CATEGORY, result.date, error.message)
            if (res) {
                return res.status(500).send({ message: 'Error in sending nytimes.com Maxi data to wordpress server' })
            }
        }
    }
    if (res) {
        res.send({ message: 'Request done successfully for nytimes.com Maxi' })
    }
}


exports.crawlMiniAPI = crawlMiniAPI
exports.crawlMini = crawlMini
exports.crawlMaxiAPI = crawlMaxiAPI
exports.crawlMaxi = crawlMaxi
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI
exports.sendDataToProductionForMaxi = sendDataToProductionForMaxi
exports.sendDataToProductionForMini = sendDataToProductionForMini