const momentTZ = require('moment-timezone');

function currentTehranDate() {
    return momentTZ().tz("Asia/Tehran").format('M-D-YY');
}
function tommarowTehranDate() {
    return momentTZ().add(1,'day').tz("Asia/Tehran").format('M-D-YY');
}

module.exports = {
    currentTehranDate: currentTehranDate,
    tommarowTehranDate: tommarowTehranDate
}