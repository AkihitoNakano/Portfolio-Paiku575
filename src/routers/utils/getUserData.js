const User = require('../../models/user')
const Contents = require('../../models/content')
const { dateForCard } = require('./date')

// user = req.user

// カードに出力するデータの中身を定義する
function setCardData(user, profile, content, avatar, image) {
  const cards = {
    displayName: profile.displayName,
    accountName: user.accountName,
    avatar,
    image,
    comments: content.comments,
    contentId: content._id,
    description: content.description,
    experience: content.experience,
    tags: content.tags,
    fans: content.fans,
    voted: content.voted,
    date: content.createdAt,
  }

  return cards
}

// ユーザー情報からカードを取得する
async function getCardContents(user, limit, skip) {
  const contents = await Contents.find({ owner: user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * skip)

  await user.populate('profile')
  const profile = user.profile[0]
  const cardContents = []
  for (const content of contents) {
    const avatar = getImgPath('avatars', profile.avatar)
    const cardImg = getImgPath('cards', content.image)
    // 必要なカード情報だけを取り出してまとめる
    const card = setCardData(user, profile, content, avatar, cardImg)

    cardContents.push(card)
  }

  return cardContents
}

// contentsカードからカード情報を取得する
async function getCardFromContents(contents) {
  const cardContents = []
  for (const content of contents) {
    await content.populate('user')
    const cardAuthor = content.user[0]
    await content.populate('profile')
    const authorProfile = content.profile[0]

    const avatar = getImgPath('avatars', authorProfile.avatar)
    const cardImg = getImgPath('cards', content.image)
    const card = setCardData(cardAuthor, authorProfile, content, avatar, cardImg)

    cardContents.push(card)
  }

  return cardContents
}

// ranking用に抽出したデータからカード用のデータに出力する
async function getCardFromRanking(contents) {
  const cardContents = []
  for (const content of contents) {
    const user = await User.findOne({ _id: content.owner })
    await user.populate('profile')
    const profile = user.profile[0]

    const avatar = getImgPath('avatars', profile.avatar)
    const cardImg = getImgPath('cards', content.image)

    const card = setCardData(user, profile, content, avatar, cardImg)
    cardContents.push(card)
  }
  return cardContents
}

// homeページに表示する最新のカードを取得する
async function getLatestCards(follows, owner, limit, skipPage = 0) {
  const skip = skipPage

  const latestContents = await Contents.find({
    owner: { $in: [...follows, owner._id] },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * skip)

  const mergedCards = await getCardFromContents(latestContents)

  return mergedCards
}

// homeページでのtopicのカードを取得する
async function getTopicCards(tags, limit, skip = 0) {
  const cardIds = []

  tags.forEach(tag => {
    if (tag.card) {
      cardIds.push(tag.card)
    }
  })

  const contentsList = await Contents.find({ _id: { $in: cardIds } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * skip)

  return await getCardFromContents(contentsList)
}

// コメントチェーンのカードを表示する
async function getCommentChain(comments, limit, skip) {
  const contentsList = await Contents.find({ _id: { $in: comments } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * skip)

  return await getCardFromContents(contentsList)
}

// ユーザーからプロフィール情報を引き出す
async function getUserProfile(user) {
  await user.populate('profile')
  const avatar = getImgPath('avatars', user.profile[0].avatar)
  const date = dateForCard(user.createdAt)
  let mySelectText
  if (user.profile[0].mySelect) {
    mySelectText = await Contents.findOne({ _id: user.profile[0].mySelect })
    if (mySelectText) {
      mySelectText = mySelectText.description
    }
  } else {
    mySelectText = ''
  }

  let displayName
  if (!user.profile[0].displayName) {
    displayName = 'no-name'
  } else {
    displayName = user.profile[0].displayName
  }

  const customProfile = {
    avatar,
    displayName,
    rank: user.profile[0].rank,
    place: user.profile[0].place,
    selfIntroduction: user.profile[0].selfIntroduction,
    tickets: user.profile[0].tickets,
    mySelect: mySelectText,
    follows: user.profile[0].follows.length,
    followers: user.profile[0].followers.length,
    date,
  }
  return customProfile
}

// プロフィール用のユーザー情報整理する
async function createUserProfile(user) {
  const accountName = user.accountName
  const userId = user._id
  const { displayName, avatar, selfIntroduction, rank, place, mySelect, tickets, follows, followers, date } =
    await getUserProfile(user)

  const userProfile = {
    userId,
    accountName,
    displayName,
    avatar,
    selfIntroduction,
    mySelect,
    tickets,
    rank,
    place,
    follows,
    followers,
    date,
  }
  return userProfile
}

// 画像のフォルダパスを引っ張る
function getImgPath(path, imgName) {
  if (path === 'avatars') {
    if (!imgName || imgName === '') return isReplaceImg('avatar')
  } else if (path === 'cards') {
    if (!imgName || imgName === '') return isReplaceImg('none')
  }
  // const folderNum = imgName.split('_')[0]
  const baseUrl = 'https://storage.googleapis.com/paiku_file_uploads/'
  return `${baseUrl}${imgName}`
}

// 画像データがなければ代わりに何を返すか
function isReplaceImg(isReplace) {
  switch (isReplace) {
    case 'avatar':
      return '/img/icon/avatar_default.svg'
    case 'none':
      return
  }
}

module.exports = {
  getCardContents,
  createUserProfile,
  getUserProfile,
  getLatestCards,
  getCardFromContents,
  getCardFromRanking,
  getTopicCards,
  getCommentChain,
  getImgPath,
}
