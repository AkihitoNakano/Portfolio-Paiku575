const { Router } = require('express')
const mongoose = require('mongoose')
const Contents = require('../models/content')
const User = require('../models/user')
const Tag = require('../models/tag')
const { auth } = require('../middleware/auth')
const { upImg, uploadImageToCloudStorage, deleteImageInCloudStorage } = require('./utils/file')
const {
  getCardContents,
  getLatestCards,
  getCardFromContents,
  getTopicCards,
  getCommentChain,
} = require('./utils/getUserData')
const { getRebuildVotedCards } = require('./utils/getVoted')

const router = Router()
// /content

// 新規575の投稿
router.post('/', auth, upImg.single('img'), async (req, res) => {
  try {
    const { description, tags, date, commentId } = req.body
    const content = new Contents({
      description,
      date,
      owner: req.user._id,
    })

    if (req.file) {
      // google cloud storageにアップロードする
      const fileName = await uploadImageToCloudStorage(req.file, 'card')
      content.image = fileName
    }
    if (tags.trim().length !== 0) {
      content.tags = tags.split(',')
      await Tag.addTag(tags.split(','), content._id)
    }
    if (commentId) {
      await content.addComment(commentId)
    }

    await content.save()
    const newCard = await getCardContents(req.user, 1)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    newCard.push(me)
    res.status(201).send(newCard)
  } catch (e) {
    console.log(e)
    res.status(400).send(e)
  }
})

// 特定のカードのコンテンツデータを一つ取得する
router.get('/card/:id', auth, async (req, res) => {
  try {
    const cardId = req.params.id
    const content = await Contents.find({ _id: cardId })

    const card = await getCardFromContents(content)
    res.send(card[0])
  } catch (err) {
    console.log(err)
    res.status(400).send()
  }
})

// home画面でのフォロワーの最新カードを取得する
router.get('/latest', auth, async (req, res) => {
  try {
    const limit = req.query.limit
    const skip = req.query.skip
    if (!limit || isNaN(limit)) throw new Error()
    if (!skip || isNaN(skip)) throw new Error()

    const owner = req.user
    await owner.populate('profile')
    const ownerProfile = owner.profile[0]
    const cards = await getLatestCards(ownerProfile.follows, owner, limit, skip)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    cards.push(me)

    res.send(cards)
  } catch (err) {
    console.log(err)
    res.status(500).send('カードが取得できませんでした')
  }
})

// home画面でトピックのカードを取得する
router.get('/topic', auth, async (req, res) => {
  try {
    const limit = req.query.limit
    const skip = req.query.skip
    if (!limit || isNaN(limit)) throw new Error()
    if (!skip || isNaN(skip)) throw new Error()

    const tagName = req.query.tag
    const tag = await Tag.find({ name: tagName })
    if (tag.length <= 0) {
      res.status(404).send()
    }

    const cards = await getTopicCards(tag[0].cards, limit, skip)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    cards.push(me)

    res.send({ cards, tagName })
  } catch (err) {
    console.log(err)
  }
})

// home画面でのコメントチェーンのカードを取得する
router.get('/comment', auth, async (req, res) => {
  try {
    let limit = req.query.limit
    let skip = req.query.skip
    if (!limit || isNaN(limit)) throw new Error()
    if (!skip || isNaN(skip)) throw new Error()

    const id = mongoose.Types.ObjectId(req.query.id)
    const comments = await Contents.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          _id: 0,
          comments: 1,
        },
      },
    ])

    const cards = await getCommentChain(comments[0].comments, limit, skip)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    cards.push(me)

    res.send(cards)
  } catch (err) {
    console.log(err)
    res.status(500).send()
  }
})

// cardを削除する
router.delete('/:id', auth, async (req, res) => {
  try {
    const cardId = req.params.id
    const card = await Contents.findOne({ _id: cardId })

    if (card.owner.toString() !== req.user._id.toString()) {
      throw new Error()
    }
    const fileName = card.image
    await card.deleteOne()

    if (fileName) {
      await deleteImageInCloudStorage(fileName)
    }

    res.send()
  } catch (err) {
    res.status(500).send()
  }
})

// プロフィールユーザが投稿したカード情報を取得する
router.get('/:account', auth, async (req, res) => {
  try {
    const limit = req.query.limit
    const skip = req.query.skip
    if (!limit || isNaN(limit)) throw new Error()
    if (!skip || isNaN(skip)) throw new Error()

    const user = await User.findOne({ accountName: req.params.account })
    const contents = await getCardContents(user, limit, skip)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    contents.push(me)
    res.json(contents)
  } catch (err) {
    console.log(err)
    res.status(400).send('不正な入力です')
  }
})

// プロフィールユーザがいいねしたカード情報を取得する
router.get('/fav/:account', auth, async (req, res) => {
  try {
    const limit = req.query.limit
    const skip = req.query.skip
    if (!limit || isNaN(limit)) throw new Error()
    if (!skip || isNaN(skip)) throw new Error()

    const user = await User.findOne({ accountName: req.params.account })
    const favCards = await Contents.find({ 'fans.user': user._id })
      .sort({
        'fans.date': -1,
      })
      .limit(limit)
      .skip(limit * skip)

    const contents = await getCardFromContents(favCards)
    const me = { myId: req.user._id, myAccountName: req.user.accountName }
    contents.push(me)
    res.json(contents)
  } catch (err) {
    console.log(err)
    res.status(404).send('そのユーザーIDはありません')
  }
})
// プロフィール投票したカード情報を取得する
router.get('/vote/:account', auth, async (req, res) => {
  try {
    const user = await User.findOne({ accountName: req.params.account })
    const limit = 30
    const votedCards = await Contents.find({ 'voted.user': user._id })
      .sort({
        'voted.createdAt': -1,
      })
      .limit(limit)

    // forEachを多用しているため改善できるのであればする
    const voteList = []
    votedCards.forEach(votedCard => {
      votedCard.voted.forEach(voteUser => {
        if (voteUser.user.toString() === user._id.toString()) {
          const rePackCard = {
            cardID: votedCard._id,
            createdAt: voteUser.createdAt,
          }
          voteList.push(rePackCard)
        }
      })
    })

    const orderedCard = await getRebuildVotedCards(voteList, votedCards)

    res.json(orderedCard)
  } catch (err) {
    console.log(err)
    res.status(404).send('そのユーザーIDはありません')
  }
})

// my selectの登録
router.post('/select/:id', auth, async (req, res) => {
  try {
    const cardId = req.params.id
    await req.user.populate('profile')
    await req.user.profile[0].addMySelect(cardId, req.user.profile[0])

    res.send()
  } catch (err) {
    console.log(err)
    res.status(404).send('そのカード、またはユーザーはありません')
  }
})

// fav(heart)の登録
router.post('/fav/:id', auth, async (req, res) => {
  try {
    const cardId = req.params.id
    const card = await Contents.findOne({ _id: cardId })
    const favLength = await card.addFav(req.user._id)
    res.send(favLength.toString())
  } catch (err) {
    console.log(err)
    res.status(404).send('そのカードidはありません')
  }
})

// fav(heart)の取り消し
router.delete('/fav/:id', auth, async (req, res) => {
  try {
    const cardId = req.params.id
    const card = await Contents.findOne({ _id: cardId })
    const favLength = await card.removeFav(req.user._id)
    res.send(favLength.toString())
  } catch (err) {
    console.log(err)
    res.status(404).send('そのカードidはありません')
  }
})

// voteの追加
router.post('/vote/:id', auth, async (req, res) => {
  try {
    await req.user.populate('profile')
    const ticketNum = await req.user.profile[0].adjTicketCount()
    const cardId = req.params.id
    const card = await Contents.findOne({ _id: cardId })
    const votedNum = await card.addVote(req.user._id)
    res.send({ votedNum: votedNum.toString(), ticketNum })
  } catch (err) {
    console.log(err)
    res.status(500).send('そのIDはありません', err)
  }
})

module.exports = router
