require('dotenv').config();
const prisma = require('./prisma/prisma-client');
const express = require('express');
const app = express();

const nytRouters = require("./business-logic/nyt/nyt.routes");
const HttpError = require('./utils/http-error');
const SevenLittleWordsRouter = require("./business-logic/seven-little-words/seven-little-words-crawler.routes");
const dailyThemeRouter = require("./business-logic/daily-theme/daily-theme.routes");
const xWordRouter = require("./business-logic/xword/xword.routes");
const nytimesRouter = require("./business-logic/nytimes/nytimes.routes");

// کدام سرویس ها اجرا شود

//require('./cronjob/nyt-mini');
//require('./cronjob/nyt-maxi'); for nyt maxi
//require('./cronjob/xword'); // for nyt maxi 

require('./cronjob/nytimes-maxi'); // for nyt maxi


require('./cronjob/nytimes-mini'); // for nyt maxi

//require('./cronjob/seven-little-words');

//require('./cronjob/daily-theme');





app.use("/nyt", nytRouters);
app.use("/seven-little-words", SevenLittleWordsRouter);
//app.use("/daily-theme", dailyThemeRouter);
app.use("/xword", xWordRouter);
app.use("/nytimes", nytimesRouter);


app.use((req, res, next) => {
    const error = new HttpError("Could not found this route", 404);
    throw error;
})

app.use((error, req, res, next) => {
    res.status(error.statusCode || 500);
    res.json({
        code: error.code || -1,
        message: error.message || "An unknown error occurred!",
    });
});

// const cl = require('./business-logic/nyt/nyt.controller');

// cl.sendDataToProductionForMini()

module.exports = app;
