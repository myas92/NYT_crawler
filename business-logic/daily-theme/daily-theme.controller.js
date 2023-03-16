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
    } catch (error) {
        console.log(error)
    }
}

// ---------------------------------------- Mini For Daily Theme ----------------------------------------
// ---------------------------------------- Mini For Daily Theme ----------------------------------------

const crawlDailyThemeMiniAPI = async (req, res, next) => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Daily-Theme-Mini ** API --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new DailyThemeCrwalerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMini();
        // await sendDataDailyThemeToProductionForMini()
        console.log('---------------------- Crawler ended for ** Daily-Theme-Mini **  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlDailyThemeMini = async () => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Daily-Theme-Mini ** API --------------------')
        date = date ? date : currentTehranDate();
        let dailyThemeResult = new DailyThemeCrwalerService(date);
        questionsAnswers = await dailyThemeResult.getQuestionAnswerForMini();
        // await sendDataDailyThemeToProductionForMini()
        console.log('---------------------- Crawler ended for ** Daily-Theme-Mini **  API--------------------')
    } catch (error) {
        console.log(error)
    }
}



// --------------------------------- WordPress ----------------------------------------------
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

const sendDataDailyThemeToProductionForMini = async (req, res) => {
    const date = currentTehranDate();
    let title_date = momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().subtract(5,'minutes').format('YYYY-MM-DD HH:mm:ss'); // -5 minutes for maxi
    const category = 'Daily-Theme-Maxi';
    let resultMaxi = await prisma.daily_theme_mini.findFirst({
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
            url: process.env.SPEEADREADINGS_URL_Mini,
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


const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: getQuestionsAnswerForDailyThemeAPI: ${moment().format('M-D-YY')} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
        let { date } = req.query;
        let { category } = req.query;
        let statusCode = 404
        let message = "Please try again later";
        let result = []
        date = date ? date : currentTehranDate();
        let title_date = date ? moment(date, 'MM-DD-YY').format('YYYY-MM-DD') : momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
        let fullDateFormat = moment().utc().format('YYYY-MM-DD HH:mm:ss');
        let resultMini;
        let resultMaxi;
        let qa_id = '';
        message = "Request done successfully";
        if (category == 'Daily-Theme-Mini' || !category) {
            resultMini = await prisma.daily_theme_mini.findFirst({
                where: {
                    date: date
                }
            })
        }
        if (category == 'Daily-Theme-Maxi' || !category) {
            resultMaxi = await prisma.daily_theme_maxi.findFirst({
                where: {
                    date: date
                }
            })
        }
        if (!resultMaxi && !resultMini) {
            return res.status(statusCode).json({ message: "There is no data in this date: Daily-Theme", qa_id, title_date, date: fullDateFormat, category, result: [] })
        }
        else if (resultMaxi || resultMini) {
            if (category == 'Daily-Theme-Maxi') {
                result = [...resultMaxi.questions_answers];
                qa_id = resultMaxi.qa_id

            }
            else if (category == 'Daily-Theme-Mini') {
                result = [...resultMini.questions_answers];
                qa_id = resultMini.qa_id
            }
            else {
                result = [...resultMini?.questions_answers, ...resultMaxi?.questions_answers];
                category = ''
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

exports.crawlDailyThemeMaxiAPI = crawlDailyThemeMaxiAPI
exports.crawlDailyThemeMiniAPI = crawlDailyThemeMiniAPI
exports.crawlDailyThemeMaxi = crawlDailyThemeMaxi
exports.crawlDailyThemeMini = crawlDailyThemeMini
exports.getQuestionsAnswerMaxiAPI = getQuestionsAnswerMaxiAPI

exports.sendDataDailyThemeToProductionForMaxi = sendDataDailyThemeToProductionForMaxi
exports.sendDataDailyThemeToProductionForMini = sendDataDailyThemeToProductionForMini
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI