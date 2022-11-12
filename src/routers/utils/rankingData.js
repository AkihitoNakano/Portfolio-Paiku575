const { getCardFromRanking } = require('./getUserData')
const Content = require('../../models/content')
const moment = require('moment')

// タイムゾーンを日本時間にする
moment.locale('ja')

// 総合ランキングを取得する
async function getOverallRanking(limit, user) {
  const totalRankingCards = await Content.aggregate([
    {
      $project: {
        description: 1,
        image: 1,
        experience: 1,
        comments: 1,
        owner: 1,
        fans: 1,
        voted: 1,
        tags: 1,
        createdAt: 1,
        length: { $size: '$voted' },
      },
    },
    {
      $sort: { length: -1 },
    },
    { $limit: limit },
  ])

  const result = await getCardFromRanking(totalRankingCards)

  const data = {
    myId: user._id,
    myAccountName: user.accountName,
  }
  result.push(data)

  return result
}

// 日、週、月、年間ランキングを取得する
async function getRanking(limit, user, period) {
  // 今日の始まりを設定する
  const date = moment().startOf(period.toString())

  const todayRankingCards = await Content.aggregate([
    {
      $project: {
        description: 1,
        image: 1,
        experience: 1,
        comments: 1,
        owner: 1,
        fans: 1,
        voted: 1,
        tags: 1,
        createdAt: 1,
        length: { $size: '$voted' },
      },
    },
    {
      $match: {
        createdAt: {
          $gte: date.toDate(),
          $lte: moment(date).endOf(period).toDate(),
        },
      },
    },
    {
      $sort: { length: -1 },
    },
    { $limit: limit },
  ])

  const result = await getCardFromRanking(todayRankingCards)

  const data = {
    myId: user._id,
    myAccountName: user.accountName,
  }
  result.push(data)

  return result
}

async function selectCategory(target, limit, user) {
  let result
  switch (target) {
    case 'all':
      result = await getOverallRanking(limit, user)
      break
    case 'today':
      result = await getRanking(limit, user, 'day')
      break
    case 'weekly':
      result = await getRanking(limit, user, 'week')
      break
    case 'monthly':
      result = await getRanking(limit, user, 'month')
      break
    case 'year':
      result = await getRanking(limit, user, 'year')
      break
    default:
      throw new Error('そのクエリはありません')
  }
  return result
}

module.exports = {
  getOverallRanking,
  selectCategory,
}
