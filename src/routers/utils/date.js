const moment = require('moment')

function dateForCard(dateTime) {
  const date = moment(dateTime)

  return date.format('YYYY/MM/DD')
}

module.exports = {
  dateForCard,
}
