const mongoose = require('mongoose')

const contentsSchema = new mongoose.Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  image: {
    type: String,
    trim: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contents',
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  fans: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      date: {
        type: Date,
        default: () => new Date(),
      },
    },
  ],
  voted: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        immutable: true,
        default: () => new Date(),
      },
    },
  ],
  tags: [String],
  createdAt: {
    type: Date,
    immutable: true,
    default: () => new Date(),
  },
})

contentsSchema.virtual('user', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
})

contentsSchema.virtual('profile', {
  ref: 'Profile',
  localField: 'owner',
  foreignField: 'owner',
})

// Favを登録
contentsSchema.methods.addFav = async function (myId) {
  try {
    const card = this
    card.fans = card.fans.concat({ user: myId })
    await card.save()
    return card.fans.length
  } catch (err) {
    console.log(err)
    return err
  }
}

// Favを取り消す
contentsSchema.methods.removeFav = async function (myId) {
  try {
    const card = this
    card.fans = card.fans.filter(fan => {
      return fan.user.toString() !== myId.toString()
    })
    await card.save()
    return card.fans.length
  } catch (err) {
    console.log(err)
    return err
  }
}

// voteを追加
contentsSchema.methods.addVote = async function (myId) {
  try {
    const card = this
    card.voted = card.voted.concat({ user: myId })
    await card.save()
    return card.voted.length
  } catch (err) {
    console.log(err)
    return err
  }
}

// コメントチェーンを追加
contentsSchema.methods.addComment = async function (commentId) {
  try {
    const commentCard = this
    const baseCard = await Contents.findOne({ _id: commentId })
    baseCard.comments = baseCard.comments.concat(commentCard)

    await baseCard.save()
  } catch (err) {
    console.log(err)
  }
}

const Contents = new mongoose.model('Contents', contentsSchema)

module.exports = Contents
