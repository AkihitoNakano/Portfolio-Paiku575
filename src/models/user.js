const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Profile = require('./profile')
const Content = require('./content')
const { isEmail } = require('validator')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const secretKey = process.env.SECRET

const userSchema = new mongoose.Schema({
  accountName: {
    type: String,
    unique: true,
    minLength: 3,
    maxLength: 15,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Email is invalid'],
  },
  password: {
    type: String,
    minLength: 6,
  },
  role: {
    type: String,
    required: true,
    default: 'BASIC',
  },

  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],

  createdAt: {
    type: Date,
    immutable: true,
    default: () => new Date(),
  },
})

userSchema.virtual('contents', {
  ref: 'Contents',
  localField: '_id',
  foreignField: 'owner',
})

userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'owner',
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.email
  delete userObject.password
  delete userObject.tokens
  delete userObject.role
  delete userObject.__v

  return userObject
}

const maxAge = 30 * 24 * 60 * 60
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, secretKey, {
    expiresIn: maxAge,
  })
  user.tokens = user.tokens.concat({ token })

  await user.save()

  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

userSchema.statics.confirmCredential = async (inputPass, user) => {
  if (!user) {
    throw new Error('パスワードが合いません')
  }
  const isMatch = await bcrypt.compare(inputPass, user.password)
  if (!isMatch) {
    throw new Error('パスワードが合いません')
  }

  return isMatch
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this
  const salt = await bcrypt.genSalt()
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, salt)
  }

  next()
})

userSchema.pre('remove', async function (next) {
  const user = this
  await Profile.deleteMany({ owner: user._id })
  await Content.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
