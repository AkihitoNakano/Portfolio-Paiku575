const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { checkTickets } = require('../middleware/checkTickets')
const { createUserProfile } = require('./utils/getUserData')
const { getDateTopics } = require('./utils/themData')
const router = Router()

// theme
router.get('/', auth, checkTickets, async (req, res) => {
  const tickets = req.tickets
  const userProfile = await createUserProfile(req.user)
  res.render('theme', { userProfile, tickets })
})

// tagを取得する
router.get('/get', auth, async (req, res) => {
  try {
    // year, month ,week, dateを選べる
    const day = await getDateTopics('day', 7)
    const month = await getDateTopics('month', 17)
    const week = await getDateTopics('week', 3)
    const year = await getDateTopics('year', 100)

    res.json([day, month, week, year])
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
