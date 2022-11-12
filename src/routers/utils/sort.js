// 集めたvoteカードをソートして無駄な情報を省く
function sortContents(cards) {
  cards.sort((a, b) => {
    const first = new Date(a.createdAt)
    const second = new Date(b.createdAt)
    if (first < second) return 1
    if (first > second) return -1
    return 0
  })
  return cards
}

module.exports = { sortContents }
