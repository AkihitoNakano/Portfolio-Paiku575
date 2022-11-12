const Tag = require('../../models/tag')
const moment = require('moment')

// タイムゾーンを日本時間にする
moment.locale('ja')

// 期間での増加量を比較する
async function getDateTopics(dateStr, limit) {
  const date = moment().startOf(dateStr)
  const tags = await Tag.aggregate([
    {
      $match: { updatedAt: { $gte: date.toDate() } },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        cards: {
          $filter: {
            input: '$cards',
            as: 'cards',
            cond: { $gte: ['$$cards.createdAt', date.toDate()] },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        length: { $size: '$cards' },
      },
    },
    { $sort: { length: -1 } },
    { $limit: limit },
  ])

  const tagTitle = showTopicTitle(dateStr)
  tags.push(tagTitle)

  return tags
}

// トピックのタイトルを選ぶ
function showTopicTitle(dateStr) {
  let text = ''
  switch (dateStr) {
    case 'day':
      text = '本日の話題のトピック'
      break
    case 'month':
      text = '今月のトピック'
      break
    case 'week':
      text = '今週のトピック'
      break
    case 'year':
      text = '今年のトピック'
      break
  }

  return text
}

module.exports = {
  getDateTopics,
}
