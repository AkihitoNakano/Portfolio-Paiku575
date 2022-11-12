const path = require('path')
const express = require('express')
require('./db/mongoose')
const hbs = require('hbs')
const { auth, checkUser } = require('./middleware/auth')
const cookieParser = require('cookie-parser')
const userRouter = require('./routers/user')
const homeRouter = require('./routers/home')
const contentRouter = require('./routers/content')
const profileRouter = require('./routers/profile')
const rankingRouter = require('./routers/ranking')
const themeRouter = require('./routers/theme')
const indexRouter = require('./routers/index')

const favicon = require('serve-favicon')
const displayMaintenance = require('./middleware/maintenance')

/*    デバッグ用    */
const debugRouter = require('../tests/routes/router_debug')
/*    デバッグ用    */

const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// register view engine
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

// middleware
app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(cookieParser())
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))

app.disable('x-powered-by')

/*    メンテ用    */
// app.use('*', displayMaintenance)
/*    メンテ用    */

// ルーティング
app.get('*', checkUser)
app.get('/', auth, (req, res) => res.redirect('/home'))
app.get('/index', (req, res) => res.render('index'))
app.use('/home', homeRouter)
app.use('/user', userRouter)
app.use('/ranking', rankingRouter)
app.use('/content', contentRouter)
app.use('/theme', themeRouter)
app.use(indexRouter)
app.use(profileRouter)

// デバッグ用
app.use(debugRouter)
app.get('/test/test', (req, res) => res.send('test'))
module.exports = app
