const Profile = require('../../models/profile')
const User = require('../../models/user')
const Content = require('../../models/content')
const { getImgPath } = require('./getUserData')

// ネームカードに表示するプロフィール情報を取得する
async function createNamedCardProfile(user) {
  const temp = await Profile.find({ owner: user._id })
  const avatar = getImgPath('avatars', temp[0].avatar)
  const { displayName, selfIntroduction } = temp[0]

  const profileList = {
    _id: user._id,
    accountName: user.accountName,
    avatar,
    displayName,
    selfIntroduction,
  }

  if (temp[0].mySelect) {
    const mySelectCard = await Content.aggregate([
      { $match: { _id: temp[0].mySelect } },
      { $project: { description: 1 } },
    ])

    if (mySelectCard.length !== 0) {
      profileList.mySelect = mySelectCard[0].description
    }
  }

  return profileList
}

// フォロー、フォロワーページで表示するユーザーのネームカードを取得する
async function getNameCardUsers(followList, limit, skip, me) {
  const limitedUser = followList.slice(+skip * limit, +skip * limit + limit)
  const users = []

  const userList = await User.aggregate([
    { $match: { _id: { $in: limitedUser } } },
    { $project: { _id: 1, accountName: 1 } },
  ])

  for (const user of userList) {
    const partOfCard = await createNamedCardProfile(user)
    const isFollow = await isFollowUser(me, partOfCard._id)

    const cardNameInfo = {
      avatar: partOfCard.avatar,
      displayName: partOfCard.displayName,
      accountName: partOfCard.accountName,
      selfIntroduction: partOfCard.selfIntroduction,
      mySelect: partOfCard.mySelect,
      isFollow,
    }
    users.push(cardNameInfo)
  }

  return users
}

// フォローしているユーザーかどうか調べる
async function isFollowUser(me, userId) {
  await me.populate('profile')
  const ownerProfile = me.profile[0]
  const isFollow = ownerProfile.follows.find(follow => {
    return follow.toString() === userId.toString()
  })
  // 書き方がダサい
  if (isFollow) return true
  return false
}

module.exports = { getNameCardUsers }
