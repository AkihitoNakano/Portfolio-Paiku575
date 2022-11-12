const User = require('../../models/user')
const Profile = require('../../models/profile')

// フォローリストから削除されたユーザーを除外する
async function removedFromFollow(id) {
  const profile = await Profile.findOne({ owner: id })

  // followsとfollowersのみのリストを作成する
  const follows = profile.follows
  const followers = profile.followers

  // 現存しているfollowユーザーを取り出す
  const existingFollows = await User.aggregate([{ $match: { _id: { $in: follows } } }, { $project: { _id: 1 } }])

  // 現存しているfollowersユーザーを取り出す
  const existingFollowers = await User.aggregate([{ $match: { _id: { $in: followers } } }, { $project: { _id: 1 } }])

  // 現存しているユーザの配列をstringに変換する
  const exitFollowsArr = existingFollows.map(follow => follow._id.toString())
  const exitFollowersArr = existingFollowers.map(follow => follow._id.toString())

  // Profileのfollowsを再編する
  profile.follows = profile.follows.filter(follow => exitFollowsArr.includes(follow.toString()) === true)
  // Profileのfollowersを再編する
  profile.followers = profile.followers.filter(follower => exitFollowersArr.includes(follower.toString()) === true)
  profile.save()
}

function objArrToSimple(objArr, keyName) {
  return objArr.map(obj => {
    return obj[keyName]
  })
}

const getArrayDiff = (array1, array2) => {
  const arr1 = [...new Set(array1)],
    arr2 = [...new Set(array2)]
  // console.log(arr1, arr2)
  return [...arr1, ...arr2].filter(value => !arr1.includes(value) || !arr2.includes(value))
}

module.exports = { objArrToSimple, removedFromFollow }
