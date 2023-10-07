const momentTZ = require('moment-timezone');
const moment = require('moment-jalaali');

function currentTehranDate() {
    return momentTZ().tz("Asia/Tehran").format('M-D-YY');
}
function tommarowTehranDate() {
    return momentTZ().add(1, 'day').tz("Asia/Tehran").format('M-D-YY');
}


function isUpperCase(str) {
    return str === str.toUpperCase();
}


function getTitleDate(date) {
    return date ? moment(date, 'MM-DD-YY').format('YYYY-MM-DD') : momentTZ().tz("Asia/Tehran").format('YYYY-MM-DD')
}
function getFullDateFormat(subtract) {
    if (subtract)
        return moment().utc().subtract(subtract, 'minutes').format('YYYY-MM-DD HH:mm:ss'); // -5 minutes for maxi
    else
        return moment().utc().format('YYYY-MM-DD HH:mm:ss')
}

function isEmpty(item) {
    if (item == null || JSON.stringify(item) === '{}' || item?.length == 0)
        return true
    else
        return false
}
module.exports = {
    currentTehranDate,
    tommarowTehranDate,
    isUpperCase,
    isEmpty,
    getTitleDate,
    getFullDateFormat
}