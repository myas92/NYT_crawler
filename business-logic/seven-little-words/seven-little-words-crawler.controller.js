const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const axios = require('axios');
const SevenLittleWordsCrwalerService = require('./seven-little-words-crawler.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const { currentTehranDate, tommarowTehranDate } = require("../../utils/helper");

const crawlSevenLittleWordsAPI = async (req, res, next) => {
    try {
        let { date } = req.query
        let questionsAnswers;
        console.log('---------------------- Crawler started for ** Seven Little Words ** API --------------------')
        date = date ? date : currentTehranDate();
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
        date = currentTehranDate();
        let sevenLittleWords = new SevenLittleWordsCrwalerService(date);
        questionsAnswers = await sevenLittleWords.getQuestionAnswer()
        await sendDataToProductionForSevenLittlesWords()
        console.log('---------------------- Crawler ended for ** Seven Little Words **  API--------------------')
    } catch (error) {
        console.log(error)
    }
}


// --------------------------------------------------------------------------------
// Extract Question and answers based on links


const getQuestionsAnswerAPI = async (req, res, next) => {
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


const sendDataToProductionForSevenLittlesWords = async (req, res) => {
    date = date ? date : currentTehranDate();
    let title_date = date ? moment(date, 'MM-DD-YY').format('YYYY-MM-DD') : momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD');
    let fullDateFormat = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    let category = '7LW'
    let result = await prisma.seven_little_words.findFirst({
        where: {
            date: date
        }
    })

    if (result && result?.questions_answers.length > 1) {
        const data = JSON.stringify({
            "qa_id": result.qa_id,
            'game-name': category,
            "title_date": title_date,
            "date": fullDateFormat,
            "result": result.questions_answers
        });
        const config = {
            method: 'post',
            url: process.env.SPEEADREADINGS_URL_7LW,
            headers: {
                'Game-name': category,
                'Authorization': process.env.SPEEADREADINGS_PASSWORD,
                'Content-Type': 'application/json'
            },
            data: data
        };
        try {

            const response = await axios(config);
            console.log("Send Data to Wordpress Success [--Seven Little Words--]:\n", response.data)

            await prisma.response_info.create({
                data: {
                    qa_id: result.qa_id,
                    category: category,
                    date: result.date,
                    response: response.data?.message,
                }
            })

            // AWS Request
            try {
                config.url = process.env.SPEEADREADINGS_URL_7LW_AWS
                const response_aws = await axios(config);
                console.log('______________AWS response_7LW___________________');
                console.log(response_aws.data);
            } catch (error) {
                console.log("______________________________AWS_________________________", error);
            }

        } catch (error) {
            console.log("Send Data to Wordpress Error [--Seven Little Words--]:\n", error)
            await prisma.response_info.create({
                data: {
                    qa_id: result.qa_id,
                    category: category,
                    date: result.date,
                    response: error.message,
                }
            })

        }


    }
    if (res) {
        res.send({ message: 'Request done successfully for Maxi' })
    }
}

exports.crawlSevenLittleWordsAPI = crawlSevenLittleWordsAPI
exports.crawlSevenLittleWords = crawlSevenLittleWords
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI
exports.sendDataToProductionForSevenLittlesWords = sendDataToProductionForSevenLittlesWords