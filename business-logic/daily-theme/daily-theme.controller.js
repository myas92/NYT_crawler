const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const axios = require('axios');
const DailyThemeCrwalerService = require('./daily-theme.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const { currentTehranDate, tommarowTehranDate } = require("../../utils/helper");
const momentTZ = require('moment-timezone');

const crawlDailyThemeMaxiAPI = async (req, res, next) => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Daily-Theme-Maxi ** API --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new DailyThemeCrwalerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMaxi();
        // await sendDataDailyThemeToProductionForMaxi()
        console.log('---------------------- Crawler ended for ** Daily-Theme-Maxi **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlDailyThemeMaxi = async () => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Daily-Theme-Maxi ** API --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new DailyThemeCrwalerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMaxi();
        // await sendDataDailyThemeToProductionForMaxi()
        console.log('---------------------- Crawler ended for ** Daily-Theme-Maxi **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}




const getQuestionsAnswerMaxiAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: Seven-letter-words: ${currentTehranDate()} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
        let { date } = req.query;
        date = date ? date : currentTehranDate();
        let title_date = date ? moment(date, 'MM-DD-YY').format('YYYY-MM-DD') : momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
        let fullDateFormat = moment().format('YYYY-MM-DD HH:mm:ss');
        let category = '7LW'
        let result = await prisma.seven_little_words.findFirst({
            where: {
                date: date
            }
        })
        if (!result) {
            return res.status(404).json({ message: "There is no data for this date", date: fullDateFormat, qa_id: '', title_date, category: category, result: [] })
        }
        return res.status(200).json({ message: "Request done successfully", qa_id: result.qa_id, title_date, date: fullDateFormat, category: category, result: result.questions_answers, })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `Something went warong, plase try again later`,
            500
        );
        return next(errors);
    }
};


const sendDataDailyThemeToProductionForMaxi = async (req, res) => {
    const date = currentTehranDate();
    let title_date = momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().subtract(5,'minutes').format('YYYY-MM-DD HH:mm:ss'); // -5 minutes for maxi
    const category = 'Daily-Theme-Maxi';
    let resultMaxi = await prisma.daily_theme_maxi.findFirst({
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

            // const response = await axios(config);
            console.log(config);
            // console.log("Send Data to Wordpress Success [--Maxi--]:\n", response?.data)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMaxi.qa_id,
                    category: category,
                    date: resultMaxi.date,
                    response: response?.data?.message,
                }
            })

        } catch (error) {
            console.log("Send Data to Wordpress [--Daily-Theme-Maxi--]:\n", error)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMaxi.qa_id,
                    category: category,
                    date: resultMaxi?.date,
                    response: error.message,
                }
            })

        }


    }
    if (res) {
        res.send({ message: 'Request done successfully for Maxi' })
    }
}

exports.crawlDailyThemeMaxiAPI = crawlDailyThemeMaxiAPI
exports.crawlDailyThemeMaxi = crawlDailyThemeMaxi
exports.getQuestionsAnswerMaxiAPI = getQuestionsAnswerMaxiAPI

exports.sendDataDailyThemeToProductionForMaxi = sendDataDailyThemeToProductionForMaxi
// exports.sendDataDailyThemeToProductionForMini = sendDataDailyThemeToProductionForMini