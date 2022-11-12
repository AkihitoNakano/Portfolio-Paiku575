import { profileLimit as limit, favLimit } from '../../config/application.config.js'
import { $cardGridEl, skip, favSkip, pageIncrement } from '../../profile.js'
import { createCard } from '../../utils/card/createCard.js'
import { loadCard, showLoader, closeLoader } from '../../utils/button.js'
import { parseQuery, showAlert } from '../../utils/docControl.js'
import { getCardContents, getUserFavContents } from '../../utils/fetch.js'

let loadEl

// カードの配置, createCard()は別のjsファイル
function displayCards(contents) {
  const { myId, myAccountName } = contents.pop()
  contents.forEach(content => {
    const cardEl = createCard(content, myId, myAccountName)
    $cardGridEl.appendChild(cardEl)
  })
}

// ロードボタンを最下部に設置する
function setLoadCardBtn() {
  let { page } = parseQuery()

  if (page === null) {
    page = 'self'
  } else if (page === 'vote') return

  loadEl = loadCard()
  setPageType(page, loadEl)
  const parentEl = document.querySelector('.card-container')

  parentEl.insertAdjacentElement('beforeend', loadEl)
}

// ページの種類をセットする
function setPageType(type, loadEl) {
  if (type !== 'self' && type !== 'fav') return
  loadEl.addEventListener('click', () => getNextPageCards(type))
}

async function getNextPageCards(type) {
  // ローディングCSSを挟む
  showLoader(loadEl.firstElementChild)

  let res, data, readLimit
  if (type === 'self') {
    res = await getCardContents(limit, skip)
    showAlert(res.status)
    readLimit = limit
  } else if (type === 'fav') {
    let { tag } = parseQuery()
    res = await getUserFavContents(favLimit, favSkip)
    showAlert(res.status)
    readLimit = favLimit
  }
  data = await res.json()
  // 読み込むカードがない場合
  if (data.length - 1 < 1) return deleteLoadBtn()
  // 残りのカードがlimit数以下だった場合
  if (data.length - 1 < readLimit) {
    displayCards(data, true)
    return deleteLoadBtn()
  }
  displayCards(data, true)
  pageIncrement(type)
  closeLoader(loadEl.firstElementChild)
}

function deleteLoadBtn() {
  const loadBtn = document.querySelectorAll('.load-card-container')
  loadBtn.forEach(btn => btn.remove())
}

export { displayCards, setLoadCardBtn }
