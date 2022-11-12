const { Router } = require('express')
const { auth } = require('../middleware/auth')
const { checkTickets } = require('../middleware/checkTickets')
const router = Router()
const { createUserProfile } = require('./utils/getUserData')

// home
router.get('/', auth, checkTickets, async (req, res) => {
  const tickets = req.tickets
  const userProfile = await createUserProfile(req.user)
  res.render('home', { userProfile, tickets })
})

module.exports = router
