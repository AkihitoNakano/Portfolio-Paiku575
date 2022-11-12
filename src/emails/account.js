const sgMail = require('@sendgrid/mail')
const State = require('../models/state')
const { validEmailEl, resetPasswordEl } = require('./mailTemplate')
require('dotenv').config

sgMail.setApiKey(process.env.SENDGRIG_APIKEY)

// 新規登録でメールアドレスが有効化どうか確認する
const sendValidateEmail = async (email, name) => {
  const hashedMail = await State.hashMail(email)
  const encodedAddress = encodeURIComponent(hashedMail)

  const tempHTML = validEmailEl(encodedAddress, name)
  sgMail.send({
    to: email,
    from: 'paiku575@gmail.com',
    subject: '【Paiku575新規ご登録】 Emailが有効かどうかの確認をお願いします',
    html: tempHTML,
  })
}
const sendResetPassword = async email => {
  const hashedMail = await State.hashMail(email)
  const encodedAddress = encodeURIComponent(hashedMail)
  const tempHTML = resetPasswordEl(encodedAddress)

  sgMail.send({
    to: email,
    from: 'paiku575@gmail.com',
    subject: '【Paiku575】 パスワード再設定の手続き',
    html: tempHTML,
  })
}

module.exports = {
  sendValidateEmail,
  sendResetPassword,
}
