const prisma = require('../prisma/prisma-client');
const statusService = require('../config/constance/status');
const { randomBytes } = require('crypto');

async function finishCrawling(table, id, questionsAnswers, board="") {
    try {
        let result = await prisma[table].update({
            where: { id: id },
            data: {
                questions_answers: questionsAnswers,
                board: board,
                status: statusService.FINISH
            },
        });
        return result
    } catch (error) {
        return error
    }

}


async function insertStartCrawling(table, date, url) {
    try {
        let result = await prisma[table].upsert({
            where: { date: date },
            update: {},
            create: {
                qa_id: randomBytes(5).toString('hex'),
                date: date,
                url: url,
                status: statusService.START
            }
        });
        return result
    } catch (error) {
        return error
    }
}
async function findByDate(table, date) {
    try {
        let result = await prisma[table].findFirst({
            where: {
                date: date
            }
        })
        return result
    } catch (error) {
        return error
    }
}
async function saveResponseWordpress(table, qa_id, category, data, response) {
    try {
        let result = await prisma[table].create({
            data: {
                qa_id: qa_id,
                category: category,
                date: data,
                response: response,
            }
        })
        return result
    } catch (error) {
        return error
    }
}



module.exports = {
    finishCrawling,
    insertStartCrawling,
    findByDate,
    saveResponseWordpress
}