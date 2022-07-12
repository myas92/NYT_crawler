const HttpError = require("../../utils/http-error");
const moment = require('moment-jalaali');
const NytCrwaler = require('./nytCrawler.services');
const prisma = require('../../prisma/prisma-client');
const crawlQuestionsAnswers = async (req, res, next) => {
    try {
        let { date } = req.params;
        let answers;
        date = date ? date : moment().format('M-D-YY');
        let nyt = new NytCrwaler(date);
        let questionlinksInfo = await nyt.getAllQuestionLinksFromHomePage()
        if (questionlinksInfo) {
            let { id, date, questions, questions_answers } = questionlinksInfo
            if (questions_answers.length < 1)
                answers = await nyt.getAllAnswersFromQuestionLinks(id, date, questions)
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
            `something went warong, plase try again later}`,
            500
        );
        return next(errors);
    }
};
const getQuestionsAnswer = async (req, res, next) => {
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
            `something went warong, plase try again later}`,
            500
        );
        return next(errors);
    }
};

exports.crawlQuestionsAnswers = crawlQuestionsAnswers
exports.getQuestionsAnswer = getQuestionsAnswer