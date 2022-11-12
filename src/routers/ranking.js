const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { checkTickets } = require('../middleware/checkTickets')
const { createUserProfile } = require('./utils/getUserData')
const { selectCategory } = require('./utils/rankingData')
const router = Router()

// /ranking

// ranking pageのレンダー
router.get('/', auth, checkTickets, async (req, res) => {
  try {
    const tickets = req.tickets
    const userProfile = await createUserProfile(req.user)
    res.render('ranking', { userProfile, tickets })
  } catch (err) {
    console.log(err)
  }
})

// fetch ranking
router.get('/:id', auth, async (req, res) => {
  try {
    const target = req.params.id
    const limit = +req.query.len

    const result = await selectCategory(target, limit, req.user)
    res.json(result)
  } catch (err) {
    console.log(err)
  }
})

// index page用にランキングのデータを取得する
router.get('/top/:id', async (req, res) => {
  try {
    const target = req.params.id
    const limit = +req.query.len

    const result = await selectCategory(target, limit, true)

    res.json(result)
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
