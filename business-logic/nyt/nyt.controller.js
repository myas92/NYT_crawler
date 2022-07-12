const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const NytCrwaler = require('./nyt-crawler.services');
const prisma = require('../../prisma/prisma-client');
const statusService = require('../../config/constance/status');
const crawlQuestionsAnswersAPI = async (req, res, next) => {
    try {
        let { date } = req.params;
        let answers;
        date = date ? date : moment().format('M-D-YY');
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            let { id, date, questions, questions_answers } = questionlinksInfo;
            if (!questions_answers){
                let requestInfo = await prisma.nyt.findFirst({
                    where: { id: id },
                })
                if (requestInfo.status != statusService.RUNNING)
                    answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions)
                // else{
                //     console.log("getAllAnswersFromQuestionLinks is Running")
                // }
                answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions)

            }
            else {
                answers = questions_answers
            }
        }
        if (!answers) {
            return res.status(201).json({ message: "Date is invalid", result: [] })
        }
        return res.status(200).json({ message: "Request done successfully", result: answers })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `something went warong, plase try again later`,
            500
        );
        return next(errors);
    }
};
const getQuestionsAnswerAPI = async (req, res, next) => {
    try {
        let { date } = req.params
        date = date ? date : moment().format('M-D-YY');
        let result = await prisma.nyt.findFirst({
            where: {
                date: date
            }
        })
        if (!result) {
            return res.status(200).json({ message: "There is no data for this date", result: [] })
        }
        return res.status(200).json({ message: "Request done successfully", result: result.questions_answers })
    } catch (error) {
        console.log(error)
        const errors = new HttpError(
            `something went warong, plase try again later`,
            500
        );
        return next(errors);
    }
};


const crawlQuestionsAnswers = async () => {
    try {
        let answers;
        console.log('---------------------- Crawler started for NYT --------------------')
        date = moment().format('M-D-YY');
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            let { id, date, questions, questions_answers } = questionlinksInfo
            if (!questions_answers) {
                let requestInfo = await prisma.nyt.findFirst({
                    where: { id: id },
                })
                if (requestInfo.status != statusService.RUNNING)
                    answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions)
                // else{
                //     console.log("getAllAnswersFromQuestionLinks is Running")
                // }
            }
            else {
                console.log('*************DATA GETED COMPLETELY****************************')
                // answers = questions_answers
            }
        }

        console.log('---------------------- Crawler ended for NYT --------------------')
    } catch (error) {
        console.log(error)
    }
};


exports.crawlQuestionsAnswersAPI = crawlQuestionsAnswersAPI
exports.getQuestionsAnswerAPI = getQuestionsAnswerAPI
exports.crawlQuestionsAnswers = crawlQuestionsAnswers