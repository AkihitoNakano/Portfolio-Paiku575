const fetch = require('node-fetch')
const router = require('express').Router()
const { checkLogin } = require('../middleware/auth')
require('dotenv').config()

// 問い合わせ内容をdiscordに転送する
router.post('/index/form', checkLogin, async (req, res) => {
  let errCode
  try {
    if (req.error) {
      errCode = 401
      throw new Error()
    }

    const postData = {
      username: req.body.username,
      content: `${req.body.content}\r@ ${req.body.contact}`,
    }

    const result = await fetch(process.env.WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })

    if (result.status === 400) {
      errCode = 400
      throw new Error()
    }

    res.status(204).send()
  } catch (err) {
    res.status(errCode).send()
  }
})

module.exports = router
