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
        console.log('---------------------- Crawler started for ** xword-Maxi ** Cron --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new XWordCrawlerService(date);
        const {questionsAnswers, message} = await dailyThemeResult.getQuestionAnswerForMaxi();
        if (message == 'done') {
            console.log(" ************** Got xword maxi---> Send Data to WP ************** ")
            await sendDataToProductionForMaxi()
        }
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


const sendDataToProductionForMaxi = async (req, res) => {
    const date = currentTehranDate();
    let title_date = momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().subtract(5, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // -5 minutes for maxi
    const category = 'NYT-Maxi';
    let resultMaxi = await prisma.xword_maxi.findFirst({
        where: {
            date: date
        }
    })

    if (resultMaxi && resultMaxi?.questions_answers.length > 1) {
        const data = JSON.stringify({
            "qa_id": resultMaxi.qa_id,
            'game-name': category,
            "title_date": title_date,
            "date": fullDateFormat,
            "result": resultMaxi.questions_answers
        });
        const config = {
            method: 'post',
            url: process.env.SPEEADREADINGS_URL_MAXI,
            headers: {
                'Game-name': category,
                'Authorization': process.env.SPEEADREADINGS_PASSWORD,
                'Content-Type': 'application/json'
            },
            data: data
        };
        try {

            const response = await axios(config);
            console.log("Send Data to Wordpress Success [--x word Maxi--]:\n", response.data)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMaxi.qa_id,
                    category: category,
                    date: resultMaxi.date,
                    response: response.data?.message,
                }
            })

        } catch (error) {
            console.log("Send Data to Wordpress [-- x word Maxi--]:\n", error?.message)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMaxi.qa_id,
                    category: category,
                    date: resultMaxi.date,
                    response: error.message,
                }
            })

        }

    }
    if (res) {
        res.send({ message: 'Request done successfully for xword Maxi' })
    }
}





exports.crawlMaxiAPI = crawlMaxiAPI
exports.crawlMaxi = crawlMaxi
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI
exports.sendDataToProductionForMaxi = sendDataToProductionForMaxi