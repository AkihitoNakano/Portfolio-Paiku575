const { Router } = require('express')
const User = require('../models/user.js')
const Profile = require('../models/profile.js')
const State = require('../models/state')
const { uploadAvatar, uploadImageToCloudStorage, deleteImageInCloudStorage } = require('./utils/file')
const { auth } = require('../middleware/auth')
const { checkTickets } = require('../middleware/checkTickets')
const { getSearchUsers } = require('./utils/getSearchUser')
const { handleErrors, checkInputForm } = require('./utils/error')
const { sendValidateEmail } = require('../emails/account')
const settingRouter = require('./settings/setting')
const router = Router()

router.use('/settings', settingRouter)

// Login page
router.get('/login', (req, res) => res.render('login'))
// Sign up page
router.get('/signup', (req, res) => res.render('signup'))
// privacy policy
router.get('/describe', (req, res) => {
  const query = req.query.page
  let about = false,
    privacy = false,
    termsOfService = false,
    form = false
  if (query === 'about') about = true
  if (query === 'privacy') privacy = true
  if (query === 'termsOfService') termsOfService = true
  if (query === 'form') form = true

  res.render('indexDescribes', { about, privacy, termsOfService, form })
})

// Create user
router.post('/signup', async (req, res) => {
  try {
    checkInputForm(req.body.password, 'パスワード', 6, 15)
    checkInputForm(req.body.accountName, 'アカウント名', 6, 15)
    const user = new User(req.body)
    await user.save()
    const profile = new Profile({
      owner: user._id,
    })
    await profile.save()

    // Stateにアカウントの状態を一時登録状態にする
    const status = await State.findOne({ email: user.email })
    if (!status) {
      await State.create({ email: user.email, state: 'new' })
    } else {
      status.state = 'new'
      status.save()
    }

    // メールアドレスが有効かどうかのメールを送る
    sendValidateEmail(user.email, user.accountName)

    res.status(201).send()
  } catch (err) {
    const errors = handleErrors(err)
    console.log(err)
    res.status(400).send(errors)
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })
    res.send({ user, token })
  } catch (err) {
    console.log(err)
    res.status(400).send()
  }
})

// update user password at home
router.patch('/me', auth, async (req, res) => {
  if (Object.keys(req.body)[0] !== 'password') {
    return res.status(400).send('有効ではない更新です')
  }

  try {
    req.user.password = req.body.password
    await req.user.save()
    res.send()
  } catch (err) {
    console.log(err)
    res.status(400).send(err)
  }
})

// update user password at outside of auth
router.patch('/me/out', async (req, res) => {
  let errorCode = 500
  try {
    if (Object.keys(req.body)[0] !== 'pass' || Object.keys(req.body)[1] !== 'hash') {
      errorCode = 400
      throw new Error()
    }

    const pass = req.body.pass
    const email = req.body.hash

    const decodeEmail = decodeURIComponent(email)
    // DBからhash化されたメールアドと一致するメールアドレスを探し出す
    const searchedMail = await State.searchAuthMail(decodeEmail)
    if (!searchedMail || searchedMail === '') {
      errorStatus = 404
      throw new Error()
    }

    // 登録していたstateを削除する
    await State.deleteOne({ email: searchedMail })

    const user = await User.findOne({ email: searchedMail })
    user.password = pass
    user.save()
    // tokenをcookieに付与する
    const token = await user.generateAuthToken()

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    res.status(201).send()
  } catch (err) {
    console.log(err)
    res.status(errorCode).send()
  }
})

// update profile
router.patch('/upload-profile', auth, uploadAvatar.single('avatar'), async (req, res) => {
  const userProfile = await Profile.findOne({ owner: req.user._id })

  if (req.file) {
    if (userProfile.avatar) {
      const oldAvatarFile = userProfile.avatar
      // 古いアバター画像をクラウドから削除する
      deleteImageInCloudStorage(oldAvatarFile)
    }
    const fileName = await uploadImageToCloudStorage(req.file, 'avatar')
    userProfile.avatar = fileName
  }
  try {
    userProfile.displayName = req.body.displayName
    userProfile.selfIntroduction = req.body.selfIntroduction
    userProfile.place = req.body.place

    await userProfile.save()
    res.send('OK')
  } catch (err) {
    console.log(err)
  }
})

// Log out user
router.post('/logout', auth, async (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 1 })
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})

// Log out all
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
})

// delete account
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// fetch check last tickets
router.get('/tickets', auth, checkTickets, async (req, res) => {
  try {
    res.send(req.tickets.toString())
  } catch (err) {
    console.log(err)
    res.status(403).send('0')
  }
})

// ユーザーを検索する
router.get('/search/:userName', auth, async (req, res) => {
  try {
    const searchName = req.params.userName
    const limit = req.query.limit
    const skip = req.query.skip

    if (limit === null || skip === null) {
      res.status(400).send()
    }
    const users = await getSearchUsers(searchName, limit, skip)

    res.send(users)
  } catch (err) {
    console.log(err)
    res.status(404).send()
  }
})

module.exports = router
