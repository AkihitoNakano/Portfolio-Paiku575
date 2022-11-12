import { latestLimit as limit, topicLimit, commentLimit } from '../../config/application.config.js'
import { createCard } from '../../utils/card/createCard.js'
import { $cardGridEl, skip, topicSkip, commentSkip, pageIncrement } from '../../home.js'
import { loadCard, showLoader, closeLoader } from '../../utils/button.js'
import { fetchComment, fetchLatestCards, fetchTopic } from '../../utils/fetch.js'
import { parseQuery, showAlert } from '../../utils/docControl.js'

let loadEl

// カードを配置する
function displayCards(contents, insertAfter = true) {
  const { myId, myAccountName } = contents.pop()
  contents.forEach(content => {
    const cardEl = createCard(content, myId, myAccountName)
    if (insertAfter) {
      $cardGridEl.appendChild(cardEl)
    } else {
      $cardGridEl.prepend(cardEl)
    }
  })
}

// ロードボタンを最下部に設置する
function setLoadCardBtn() {
  let { page } = parseQuery()

  const allowPage = ['comment', 'topic']
  if (!allowPage.includes(page)) {
    page = 'latest'
  }

  loadEl = loadCard()
  setPageType(page)

  const parentEl = document.querySelector('.card-container')

  parentEl.insertAdjacentElement('beforeend', loadEl)
}

// ページの種類をセットする
function setPageType(type) {
  if (type === 'latest' || type === 'comment' || type === 'topic') {
    loadEl.addEventListener('click', () => {
      getNextPageCards(type)
    })
  }
}

// 次ページのカードを取得する
async function getNextPageCards(type) {
  // ローディングCSSを挟む
  showLoader(loadEl.firstElementChild)

  let res, data, readLimit
  if (type === 'latest') {
    res = await fetchLatestCards(limit, skip)
    showAlert(res.status)
    readLimit = limit
  } else if (type === 'topic') {
    let { tag } = parseQuery()
    res = await fetchTopic(tag, topicLimit, topicSkip)
    showAlert(res.status)
    readLimit = topicLimit
  } else if (type === 'comment') {
    let { cardId } = parseQuery()
    res = await fetchComment(cardId, commentLimit, commentSkip)
    showAlert(res.status)
    readLimit = commentLimit
  }

  data = await res.json()

  if (type === 'topic') data = data.cards

  // 読み込むカードがない場合
  if (data.length < 1) return deleteLoadBtn()
  // 残りのカードがlimit数以下だった場合
  if (data.length < readLimit) {
    displayCards(data)
    return deleteLoadBtn()
  }

  displayCards(data)
  pageIncrement(type)
  closeLoader(loadEl.firstElementChild)
}

function deleteLoadBtn() {
  const loadBtn = document.querySelectorAll('.load-card-container')
  loadBtn.forEach(btn => btn.remove())
}

export { displayCards, getNextPageCards, setLoadCardBtn }
