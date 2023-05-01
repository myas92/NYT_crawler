const momentTZ = require('moment-timezone');

function currentTehranDate() {
    return momentTZ().tz("Asia/Tehran").format('M-D-YY');
}
function tommarowTehranDate() {
    return momentTZ().add(1,'day').tz("Asia/Tehran").format('M-D-YY');
}


function isUpperCase(str) {
    return str === str.toUpperCase();
}
module.exports = {
    currentTehranDate: currentTehranDate,
    tommarowTehranDate: tommarowTehranDate,
    isUpperCase: isUpperCase
}