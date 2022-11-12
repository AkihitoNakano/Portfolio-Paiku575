const { sortContents } = require('./sort.js')
const { getImgPath } = require('./getUserData')
const User = require('../../models/user')

async function getRebuildVotedCards(repackCard, cards) {
  const cardData = await getVotedCards(cards)
  const sortedList = sortContents(repackCard)
  return mergeData(sortedList, cardData)
}

// voteリストを定義する
function setVoteList(author, profile, avatar, content) {
  return {
    _id: content._id,
    displayName: profile.displayName,
    accountName: author.accountName,
    avatar,
    description: content.description,
  }
}

// カードの情報にまとめる
async function getVotedCards(contents) {
  const cardContents = []
  for (const content of contents) {
    const cardAuthor = await User.findOne({ _id: content.owner })
    await cardAuthor.populate('profile')
    const authorProfile = cardAuthor.profile[0]

    const avatar = getImgPath('avatars', authorProfile.avatar)

    const cards = setVoteList(cardAuthor, authorProfile, avatar, content)
    cardContents.push(cards)
  }

  return cardContents
}

function mergeData(list, data) {
  const mergedList = []
  for (ids of list) {
    const voteData = data.find(card => card._id === ids.cardID)
    voteData.createdAt = ids.createdAt
    mergedList.push(voteData)
  }
  return mergedList
}

module.exports = { getRebuildVotedCards }
