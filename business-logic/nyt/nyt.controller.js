const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const NytCrwaler = require('./nyt-crawler.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const axios = require('axios');
const momentTZ = require('moment-timezone');
const { currentTehranDate } = require("../../utils/helper");

const crawlMainQuestionAnswersAPI = async (req, res, next) => {
    try {
        let { type } = req.query;
        let questionsAnswers
        console.log('---------------------- Crawler started for NYT API --------------------')
        date = currentTehranDate();
        let nyt = new NytCrwaler(date);
        if (type == "mini") {
            questionsAnswers = await nyt.getAllQuestionAnswersForMini()
        }
        if (type == "maxi") {
            questionsAnswers = await nyt.getAllQuestionAnswersForMaxi()
        }
        console.log('---------------------- Crawler ended for NYT  API--------------------')
        return res.status(200).json({ message: "Request done successfully", date: date, result: questionsAnswers })
    } catch (error) {
        console.log(error)
    }
}
const crawlMainQuestionAnswersForMini = async () => {
    try {
        console.log('---------------------- Started: Mini NYT --------------------')
        date = currentTehranDate();
        let nyt = new NytCrwaler(date);
        let questionsAnswers = await nyt.getAllQuestionAnswersForMini()
        console.log('---------------------- Ended: Mini NYT --------------------')
    } catch (error) {
        console.log(error)
    }
}
const crawlMainQuestionAnswersForMaxi = async () => {
    try {
        console.log('---------------------- Started: Maxi NYT --------------------')
        date = currentTehranDate();
        let nyt = new NytCrwaler(date);
        let questionsAnswers = await nyt.getAllQuestionAnswersForMaxi()
        console.log('---------------------- Ended: Maxi NYT--------------------')
    } catch (error) {
        console.log(error)
    }
}

// --------------------------------------------------------------------------------
// Extract Question and answers based on links

const crawlQuestionsAnswersBasedLinksAPI = async (req, res, next) => {
    try {
        let { date, type } = req?.query;
        let answers;
        date = date ? date : currentTehranDate();
        type = type ? type : 'mini';
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            let { id, date, questions, url } = questionlinksInfo;
            let requestInfo = await prisma.nyt.findFirst({
                where: { id: id },
            })
            answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions, url)
        }
        if (!answers) {
            return res.status(201).json({ message: "Try again later", result: [] })
        }
        return res.status(200).json({ message: "Request done successfully", result: answers })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `something went wrong, please try again later`,
            500
        );
        return next(errors);
    }
};
const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        console.log(`*** GET: getQuestionsAnswerAPI: ${moment().format('M-D-YY')} -- ${moment().format('jYYYY/jMM/jDD HH:mm:ss')}`)
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
        if (category == 'NYT-Mini' || !category) {
            resultMini = await prisma.nyt_mini.findFirst({
                where: {
                    date: date
                }
            })
        }
        if (category == 'NYT-Maxi' || !category) {
            resultMaxi = await prisma.nyt_maxi.findFirst({
                where: {
                    date: date
                }
            })
        }
        if (!resultMaxi && !resultMini) {
            return res.status(statusCode).json({ message: "There is no data for this date", qa_id, title_date, date: fullDateFormat, category, result: [] })
        }
        else if (resultMaxi || resultMini) {
            if (category == 'NYT-Maxi') {
                result = [...resultMaxi.questions_answers];
                qa_id = resultMaxi.qa_id

            }
            else if (category == 'NYT-Mini') {
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
const crawlQuestionsAnswers = async (inputDate = currentTehranDate()) => {
    try {
        let answers;
        console.log('---------------------- Crawler started for NYT --------------------')
        date = inputDate;
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            let { id, date, questions, questions_answers } = questionlinksInfo
            if (!questions_answers) {
                let requestInfo = await prisma.nyt.findFirst({
                    where: { id: id },
                })
                if (requestInfo.status != statusService.RUNNING) {
                    answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions)
                }
            }
            else {
                console.log('*************DATA Got COMPLETELY****************************')
            }
        }

        console.log('---------------------- Crawler ended for NYT --------------------')
    } catch (error) {
        console.log(error)
    }
};


const doubleCheckDataForMini = async () => {
    let date = currentTehranDate();
    let mini = await prisma.nyt_mini.findFirst({
        where: {
            date: date
        }
    })
    // اگر مقدار سوال و جواب هارو نتوسته بود بگیره
    if (!mini.questions_answers) {
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            console.log("########################### Double Check for Mini -- There is no data (1) ##########################");
            console.log(currentTehranDate())
            console.log("########################### Double Check for Mini -- There is no data (1) ##########################");
            let { id, date, questions, url } = questionlinksInfo;
            let requestInfo = await prisma.nyt.findFirst({
                where: { id: id },
            })
            answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions, url)
        }
    }
    // اگه سوال و جواب هارو گرفته بود ببینه یکی هست 
    else if (mini.questions_answers?.length > 1) {
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage();
        if (questionlinksInfo) {
            let { id, date, questions, url } = questionlinksInfo;
            let requestInfo = await prisma.nyt.findFirst({
                where: { id: id },
            })
            let currentQA = await nyt.getAllAnswersFromQuestionLinksForCheck(id, date, questions, url)
            let isValid = true;
            mini.questions_answers.forEach((item, index) => {
                let foundedQ = currentQA.find(qItem => qItem.question == item.question);

                if (foundedQ && item.answer != foundedQ?.answer) {
                    isValid = false
                }
            })
            if (isValid == false) {
                console.log("########################### Double Check for Mini -- Old data is invalid (2) ##########################");
                console.log(currentTehranDate())
                console.log("########################### Double Check for Mini -- Old data is invalid  (2) ##########################");
                let { id, date, questions, url } = questionlinksInfo;
                let requestInfo = await prisma.nyt.findFirst({
                    where: { id: id },
                })
                answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions, url)
            }
        }
    }
}


const sendDataToProductionForMini = async (req, res) => {
    const date = currentTehranDate();
    let title_date = momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    const category = 'NYT-Mini';
    let resultMini = await prisma.nyt_mini.findFirst({
        where: {
            date: date
        }
    })

    if (resultMini && resultMini?.questions_answers.length > 1) {
        const data = JSON.stringify({
            "qa_id": resultMini.qa_id,
            'game-name': category,
            "title_date": title_date,
            "date": fullDateFormat,
            "result": resultMini.questions_answers
        });
        const config = {
            method: 'post',
            url: process.env.SPEEADREADINGS_URL,
            headers: {
                'Game-name': category,
                'Authorization': process.env.SPEEADREADINGS_PASSWORD,
                'Content-Type': 'application/json'
            },
            data: data
        };
        try {

            const response = await axios(config);
            console.log("Send Data to Wordpress Success [--Maini--]:\n", response.data)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMini.qa_id,
                    category: category,
                    date: resultMini.date,
                    response: response.data?.message,
                }
            })

        } catch (error) {
            console.log("Send Data to Wordpress [--Mini--]:\n", error)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMini.qa_id,
                    category: category,
                    date: resultMini.date,
                    response: error.message,
                }
            })

        }


    }
    if (res) {
        res.send({ message: 'Request done successfully for Mini' })
    }
}
const sendDataToProductionForMaxi = async (req, res) => {
    const date = currentTehranDate();
    let title_date = momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    const category = 'NYT-Maxi';
    let resultMaxi = await prisma.nyt_maxi.findFirst({
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
            console.log("Send Data to Wordpress Success [--Maxi--]:\n", response.data)
            await prisma.response_info.create({
                data: {
                    qa_id: resultMaxi.qa_id,
                    category: category,
                    date: resultMaxi.date,
                    response: response.data?.message,
                }
            })

        } catch (error) {
            console.log("Send Data to Wordpress [--Maxi--]:\n", error)
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
        res.send({ message: 'Request done successfully for Maxi' })
    }
}

exports.crawlMainQuestionAnswersAPI = crawlMainQuestionAnswersAPI
exports.crawlMainQuestionAnswersForMini = crawlMainQuestionAnswersForMini
exports.crawlMainQuestionAnswersForMaxi = crawlMainQuestionAnswersForMaxi

exports.crawlQuestionsAnswersBasedLinksAPI = crawlQuestionsAnswersBasedLinksAPI
exports.crawlQuestionsAnswers = crawlQuestionsAnswers

exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI
exports.doubleCheckDataForMini = doubleCheckDataForMini

exports.sendDataToProductionForMini = sendDataToProductionForMini
exports.sendDataToProductionForMaxi = sendDataToProductionForMaxi