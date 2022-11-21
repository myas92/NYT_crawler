const momentTZ = require('moment-timezone');

function currentTehranDate() {
    return momentTZ().tz("Asia/Tehran").format('M-D-YY');
}

module.exports = {
    currentTehranDate: currentTehranDate
}