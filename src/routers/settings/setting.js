const { Router } = require('express')
const User = require('../../models/user.js')
const State = require('../../models/state')
const { auth } = require('../../middleware/auth')
const { checkTickets } = require('../../middleware/checkTickets')
const { createUserProfile } = require('../utils/getUserData')
const { sendResetPassword } = require('../../emails/account')

const router = Router()
require('dotenv').config()
// user/settings

// 設定ページ
router.get('/', auth, checkTickets, async (req, res) => {
  const tickets = req.tickets
  const userProfile = await createUserProfile(req.user)
  res.render('settings', { userProfile, tickets })
})

// メールアドレスを入力してアカウントを探すページ
router.get('/forgot-password', (req, res) => {
  res.render('searchUser')
})

// 設定ページでuserのパスワードを確認
router.post('/confirm', auth, async (req, res) => {
  try {
    await User.confirmCredential(req.body.pass, req.user)

    const user = {
      accountName: req.user.accountName,
      email: req.user.email,
      createdAt: req.user.createdAt,
    }

    res.send(user)
  } catch (err) {
    console.log(err)
    res.status(404).send()
  }
})

// Emailアドレスがあるかどうか確認する　from searchUser
router.post('/check-email', async (req, res) => {
  let errorCode = 500
  try {
    const email = req.body.email.toString()
    const haveEmail = await User.findOne({ email })

    if (!haveEmail) {
      errorCode = 404
      throw new Error()
    }

    // Stateにアカウントの状態を一時登録状態にする
    // Stateに追加、既にある場合は更新する
    const status = await State.findOne({ email })
    if (!status) {
      await State.create({ email, state: 'forget' })
    } else {
      status.state = 'forget'
      status.save()
    }
    // メールアドレスが有効かどうかのメールを送る
    sendResetPassword(email)

    res.send()
  } catch (err) {
    console.log(err)
    res.status(errorCode).send()
  }
})

// メール有効化確認、JWTの付与、homeページへ飛ぶ
router.get('/authentication/:email', async (req, res) => {
  let errorCode = 500
  try {
    const encodedEmail = req.params.email

    const decodeEmail = decodeURIComponent(encodedEmail)
    // DBからhash化されたメールアドと一致するメールアドレスを探し出す
    const searchedMail = await State.searchAuthMail(decodeEmail)
    if (!searchedMail || searchedMail === '') {
      errorCode = 400
      throw new Error('メールアドレス不正な値です')
    }

    const isValid = await State.isValid(searchedMail)

    if (!isValid) {
      errorCode = 404
      throw new Error('メールアドレスが一致したものがありません')
    }

    // 登録していたstateを削除する
    await State.deleteOne({ email: searchedMail })

    // tokenをcookieに付与する
    const user = await User.findOne({ email: searchedMail })
    const token = await user.generateAuthToken()

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    res.redirect('/')
  } catch (err) {
    console.log(err)
    const contents = {
      title: 'paiku error',
      code: errorCode,
      message: 'アカウントを有効にできませんでした',
    }
    // errorページへとぶ
    res.render('message', { contents })
  }
})

router.get('/auth-key/:id', async (req, res) => {
  res.render('authentication')
})

module.exports = router
