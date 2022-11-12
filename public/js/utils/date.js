// 日付変換 YYYY/MM/DD
function dateForCard(dateTime) {
  const date = moment(dateTime)

  return date.format('YY/MM/DD')
}

// 日付変換 YYYY年MM月DD日
function dateAtJapan(dateTime) {
  const date = moment(dateTime)
  return date.format('YYYY年MM月DD日')
}

export { dateForCard, dateAtJapan }
