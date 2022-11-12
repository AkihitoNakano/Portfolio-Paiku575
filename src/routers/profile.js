const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { checkTickets } = require('../middleware/checkTickets')
const User = require('../models/user.js')
const { createUserProfile } = require('./utils/getUserData')
const { removedFromFollow } = require('./utils/checkUser')
const { getNameCardUsers } = require('./utils/nameCard')
const { isMe } = require('./utils/validation')
const router = Router()

// profileページをレンダー(デフォルトでは句のカードが表示)
router.get('/:account', auth, checkTickets, async (req, res) => {
  try {
    const me = req.user
    const tickets = req.tickets

    let user
    if (req.user.accountName === req.params.account) {
      user = me
    } else {
      user = await User.findOne({ accountName: req.params.account })
      if (!user) return res.redirect('/index')
    }

    // 削除されたユーザーIDをフォローリストから削除する
    removedFromFollow(user._id)

    const userProfile = await createUserProfile(user)
    const ownerIsMe = me.accountName === userProfile.accountName

    await me.populate('profile')
    const isFollow = me.profile[0].follows.find(follow => {
      return follow.toString() === user._id.toString()
    })

    res.render('profile', { userProfile, me, ownerIsMe, isFollow, tickets })
  } catch (err) {
    console.log(err, 'そのIDはありません。')
    res.status(404).send('そのIDはありません')
  }
})

// ユーザのフォロー状況が見れるページ
router.get('/follow/:account', auth, checkTickets, async (req, res) => {
  const me = req.user
  try {
    const tickets = req.tickets
    const targetUser = await User.findOne({ accountName: req.params.account })

    const { accountName, displayName, avatar } = await createUserProfile(targetUser)

    const data = {
      accountName,
      displayName,
      avatar,
    }
    res.render('profileFollowers', { data, me, tickets })
  } catch (err) {
    console.log(err)
    res.send('そのユーザーはいません')
  }
})

// avatar画像を表示する
router.get('/avatar/:account', auth, async (req, res) => {
  try {
    const user = await User.findOne({ accountName: req.params.account })

    await user.populate('profile')
    const profile = user.profile[0]

    res.set('Content-Type', 'image/png')
    res.send(profile.avatar)
  } catch (err) {
    console.log(err)
    res.status(404).send('そのユーザーIDはありません')
  }
})

// ユーザーをフォローする、ユーザーがフォローされる
router.post('/follow/:account', auth, async (req, res) => {
  try {
    const user = await User.findOne({ accountName: req.params.account })
    await req.user.populate('profile')
    await req.user.profile[0].addFollow(user)

    res.send()
  } catch (err) {
    console.log(err)
  }
})

// ユーザーのフォローが解除される、ユーザーのフォローを解除する
router.delete('/follow/:account', auth, async (req, res) => {
  try {
    const user = await User.findOne({ accountName: req.params.account })
    await req.user.populate('profile')
    await req.user.profile[0].unFollowUser(user)
    res.send()
  } catch (err) {
    console.log(err)
    res.status(404).send('そのユーザーはいません', err)
  }
})

// ユーザーのフォロー,フォロワーユーザー情報をfetchする
router.get('/get/follow/:account', auth, async (req, res) => {
  try {
    const limit = +req.query.limit
    const skip = req.query.skip
    if (!limit || isNaN(limit)) res.status(400).send()
    if (!skip || isNaN(skip)) res.status(400).send()

    const user = await User.findOne({ accountName: req.params.account })
    await user.populate('profile')

    let query = req.query.page
    if (query !== 'followers') query = 'follows'

    let followList
    if (query === 'followers') {
      followList = user.profile[0].followers
    } else {
      followList = user.profile[0].follows
    }

    const users = await getNameCardUsers(followList, limit, skip, req.user)
    const me = isMe(req.user._id, req.user.accountName)

    res.send({ users, me })
  } catch (err) {
    console.log(err)
    res.status(404).send('そのユーザーはいません')
  }
})

module.exports = router
