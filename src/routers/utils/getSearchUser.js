const User = require('../../models/user')
const { getImgPath } = require('./getUserData')

// 検索キーワード欄に加えるユーザーを取得する
async function getSearchUsers(searchName, limit, skip) {
  const users = await User.find({
    accountName: { $regex: searchName, $options: 'i' },
  })
    .limit(limit)
    .skip(limit * skip)

  return await collectData(users)
}

function setListData(user, profile, avatar) {
  return {
    accountName: user.accountName,
    avatar,
    displayName: profile.displayName,
    selfIntro: profile.selfIntroduction,
  }
}

async function collectData(users) {
  const userList = []

  for (const user of users) {
    await user.populate('profile')
    const userProfile = user.profile[0]
    const avatar = getImgPath('avatars', userProfile.avatar)
    const userSet = setListData(user, userProfile, avatar)
    userList.push(userSet)
  }

  return userList
}

module.exports = { getSearchUsers }
