import { latestLimit as limit, topicLimit, commentLimit } from './config/application.config.js'
import * as postForm from './subContents/home/postForm.js'
import { parseQuery } from './utils/docControl.js'
import { cardEvent } from './utils/card/cardEventFire.js'
import { displayCardLoader, deleteCardLoader } from './utils/card/cardLoader.js'
import { fetchLatestCards, fetchTopic, fetchComment, fetchCommentRoot } from './utils/fetch.js'
import { displayCards, setLoadCardBtn } from './subContents/home/homeFunc.js'

export const $cardGridEl = document.querySelector('.card-grid')

export let skip = 0
export let topicSkip = 0
export let commentSkip = 0

initCardGrid()
postForm.isLessTextCount()

// カード配置のイニシャライズ
async function initCardGrid() {
  // pageは何のコンテンツを表示するコンテンツか示す、topicである場合tagが必要、cardIdのみであればシングルカードのページ
  const { page, tag, cardId } = parseQuery()

  try {
    if (page === 'topic') {
      // ローディング
      displayCardLoader($cardGridEl, topicLimit)
      const res = await fetchTopic(tag, topicLimit, topicSkip)

      if (res.status === 404) {
        deleteCardLoader()
        return createTitle('Sorry... そのタグはありません')
      }

      const { cards, tagName } = await res.json()

      createTitle(tagName)
      displayCards(cards)
      deleteCardLoader()

      if (cards.length < topicLimit) return
      setLoadCardBtn()
      return topicSkip++
    }
    if (page === 'comment') {
      // ローディング
      displayCardLoader($cardGridEl, commentLimit + 1)
      const rootRes = await fetchCommentRoot(cardId)
      const rootData = await rootRes.json()
      const res = await fetchComment(cardId, commentLimit, commentSkip)
      const contents = await res.json()
      contents.unshift(rootData)

      addLabel()
      displayCards(contents)
      deleteCardLoader()

      if (contents.length < commentLimit) return
      setLoadCardBtn()
      commentSkip++
      return markCommentRoot()
    }

    // ローディング
    displayCardLoader($cardGridEl, limit)
    const res = await fetchLatestCards(limit, skip)
    if (res.status === 500) return window.alert('カードが取得できませんでした')
    const contents = await res.json()
    displayCards(contents)
    deleteCardLoader()

    if (contents.length < limit) return
    setLoadCardBtn()
    skip++
  } catch (err) {
    console.log(err)
  }
}

// タイトルを作成する
function createTitle(title) {
  $cardGridEl.insertAdjacentHTML('beforebegin', `<h2>#${title}</h2>`)
}

// プッシュフォームの下にメッセージラベルを加える
function addLabel() {
  const cardContainer = document.querySelector('.card-container')
  cardContainer.insertAdjacentHTML('beforebegin', `<p class="message-title">選択した句に返信します</p>`)
}

// comment rootカードは枠線を太くする
function markCommentRoot() {
  const rootCard = $cardGridEl.firstElementChild
  rootCard.classList.add('comments-root')
}

// pageをインクリメントする
function pageIncrement(type) {
  if (type === 'latest') return skip++
  if (type === 'topic') return topicSkip++
  if (type === 'comment') return commentSkip++
}

//*カードのイベントを発火する*//
$cardGridEl.addEventListener('click', async e => cardEvent(e))

export { pageIncrement }
