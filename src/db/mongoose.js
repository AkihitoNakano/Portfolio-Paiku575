const mongoose = require('mongoose')
require('dotenv').config()

// データベース接続
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('データベース接続に成功しました'))
  .catch(e => console.log(e))
