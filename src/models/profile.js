const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  displayName: {
    type: String,
    default: 'no-name',
  },
  avatar: {
    type: String,
    trim: true,
  },
  rank: {
    type: Number,
    default: 0,
  },
  place: {
    type: String,
    default: '',
  },
  selfIntroduction: {
    type: String,
    default: '',
  },
  tickets: {
    type: Number,
    max: 10,
    default: 10,
  },
  resetDate: {
    type: Date,
    default: () => new Date(),
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  mySelect: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contents',
  },
  follows: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
})

// 他ユーザーをフォローする、他ユーザーはフォローされる
// followアクションを起こすuser profile = userProfile, フォローされるユーザー = followedUser
profileSchema.methods.addFollow = async function (followedUser) {
  try {
    const userProfile = this
    userProfile.follows.push(followedUser._id)
    userProfile.follows = [...new Set(userProfile.follows)]

    await followedUser.populate('profile')
    const followedProfile = followedUser.profile[0]
    followedProfile.followers.push(userProfile.owner)
    followedProfile.followers = [...new Set(followedProfile.followers)]

    await userProfile.save()
    await followedProfile.save()

    return
  } catch (err) {
    throw new Error(err)
  }
}

// フォローを解除
profileSchema.methods.unFollowUser = async function (user) {
  try {
    // フォロー解除ボタンを押したユーザーのフォローリストから削除する
    let userProfile = this

    userProfile.follows = userProfile.follows.filter(follow => {
      return follow.toString() !== user._id.toString()
    })

    // フォローを解除されたユーザーの処理
    await user.populate('profile')
    let followedUserProfile = user.profile[0]

    followedUserProfile.followers = followedUserProfile.followers.filter(
      follower => {
        return follower.toString() !== userProfile.owner.toString()
      }
    )

    await userProfile.save()
    await followedUserProfile.save()
  } catch (err) {
    throw new Error(err)
  }
}

// my selectを追加
profileSchema.methods.addMySelect = async function (cardId, profile) {
  profile.mySelect = cardId
  await profile.save()
}

// 投票した際にチケットの残りカウントを修正する
profileSchema.methods.adjTicketCount = async function () {
  const userProfile = this

  if (userProfile.tickets > 0) {
    userProfile.tickets -= 1
  } else if (userProfile.tickets <= 0) return -1
  userProfile.save()
  return userProfile.tickets
}

// チケットの回数をリセットする
profileSchema.methods.resetTicketCount = async function (resetDate) {
  const userProfile = this

  userProfile.tickets = 10
  userProfile.save()

  userProfile.resetDate = resetDate
  return userProfile.tickets
}

const Profile = new mongoose.model('Profile', profileSchema)

module.exports = Profile
