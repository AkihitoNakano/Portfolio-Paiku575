const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const stateSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  state: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => new Date(),
  },
})

stateSchema.methods.toJSON = function () {
  const state = this
  const stateObject = state.toObject()

  delete stateObject.key
  delete stateObject.email

  return stateObject
}

// アカウント認証でemailを含むデータがあるかどうか
stateSchema.statics.isValid = async email => {
  try {
    const result = await State.findOne({ email })
    if (!result) return false

    return true
  } catch (err) {
    throw new Error(err)
  }
}
stateSchema.statics.isValidEmailAndKey = async (email, key) => {
  try {
    const result = await State.findOne({ email, key })
    if (!result) return false

    return true
  } catch (err) {
    throw new Error(err)
  }
}

// emailをhash化する
stateSchema.statics.hashMail = async email => {
  try {
    const salt = await bcrypt.genSalt()
    let hashedMail = await bcrypt.hash(email, salt)
    return hashedMail
  } catch (err) {
    throw new Error()
  }
}

// 全てのメールアドレスを取り出し、一致するメルアドを探し出す
stateSchema.statics.searchAuthMail = async authEmail => {
  try {
    const mails = await State.aggregate([{ $project: { _id: 0, email: 1 } }])
    const pickedMail = mails.find(mail => {
      return bcrypt.compareSync(mail.email, authEmail)
    })

    if (!pickedMail) return ''

    return pickedMail.email
  } catch (err) {
    throw new Error()
  }
}

const State = mongoose.model('State', stateSchema)

module.exports = State
