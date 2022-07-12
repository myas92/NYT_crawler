require('dotenv').config();
const prisma = require('./prisma/prisma-client');
const express = require('express');
const app = express();
const moment = require('moment-jalaali');
app.get('/nyt/:date?', async (req, res) => {
    try {
        let { date } = req.params
        date = date ? date : moment().format('M-D-YY');
        let result = await prisma.nyt.findFirst({
            where: {
                date: date
            }
        })
        if (!result) {
            return res.status(201).json({ message: "Date is invalid", result: [] })
        }
        return res.status(201).json({ message: "Request done successfully", result: result.questions_answers })
    } catch (error) {
        console.log(error)
    }

})

app.listen(process.env.PORT, () => {
    console.log('App running on port:', process.env.PORT)
})