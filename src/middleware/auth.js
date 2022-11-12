const jwt = require('jsonwebtoken')
const User = require('../models/user')

require('dotenv').config()

const auth = async (req, res, next) => {
  let token
  try {
    if (req.cookies.jwt) {
      token = req.cookies.jwt
    } else {
      token = req.header('Authorization').replace('Bearer ', '')
    }
    const decoded = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      console.log('Please authenticate', err.message)
      res.redirect('/user/login')
    }

    // req.token, req.userを登録してrouterで使用する
    req.token = token
    req.user = user

    next()
  } catch (e) {
    console.log('トークンがありません, ログインしてください')
    res.redirect('/index')
  }
}

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt

  if (token) {
    jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err.message)
        res.locals.user = null
        next()
      } else {
        // console.log(decodedToken)
        let user = await User.findById(decodedToken.id)
        res.locals.user = user
        next()
      }
    })
  } else {
    res.locals.user = null
    next()
  }
}

const checkLogin = async (req, res, next) => {
  let token
  try {
    if (req.cookies.jwt) {
      token = req.cookies.jwt
    }
    const decoded = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      console.log('ユーザー認証に失敗したよ, ログインしてね')
      req.error = 410
      next()
    }

    next()
  } catch (e) {
    console.log('トークンないよ, ログインしてね')
    req.error = 410
    next()
  }
}

module.exports = {
  auth,
  checkUser,
  checkLogin,
}
