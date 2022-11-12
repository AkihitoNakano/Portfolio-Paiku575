import { rankingLimit as limit } from './config/application.config.js'
import { createRankedCard, createRankingDOM, addArrowSlider } from './subContents/ranking/rankingDOM.js'
import { cardEvent } from './utils/card/cardEventFire.js'
import { fetchOverallRankings } from './utils/fetch.js'
import { createLoader } from './utils/loader.js'

const $cardGridEl = document.querySelector('.card-grid')

initPage()

// ページのイニシャライズ
async function initPage() {
  getRanking('today')
  getRanking('weekly')
  getRanking('monthly')
  getRanking('year')
  getRanking('all')
}

// 総合ランキングの取得
async function getRanking(type) {
  let titleText = ''
  if (type === 'all') {
    titleText = '総合ランキング'
  } else if (type === 'today') {
    titleText = '本日のランキング'
  } else if (type === 'weekly') {
    titleText = '週間ランキング'
  } else if (type === 'monthly') {
    titleText = '月刊ランキング'
  } else if (type === 'year') {
    titleText = '年間ランキング'
  }

  const rankingDOM = preDisplayLoader(titleText)
  const res = await fetchOverallRankings(type, limit)
  await addCategoryToDOM(res, rankingDOM)
}

// ランキングブロックの作成とローダー表示
function preDisplayLoader(title) {
  const rankingDOM = createRankingDOM(title)
  const loader = createLoader()
  rankingDOM.insertAdjacentElement('beforeend', loader)

  $cardGridEl.appendChild(rankingDOM)
  return rankingDOM
}

// カテゴリのランキングコンテナをDOMに追加する
async function addCategoryToDOM(res, rankingDOM) {
  const data = await res.json()

  const { myId, myAccountName } = data.pop()
  // コンテンツが何もなければカテゴリDOMを画面に表示しない
  if (data.length === 0) return rankingDOM.querySelector('.loader-wrap').remove()

  const sliderContainer = rankingDOM.querySelector('.slide-container')

  data.forEach((content, idx) => {
    const wrapCardEl = createRankedCard(content, myId, myAccountName, idx)
    sliderContainer.appendChild(wrapCardEl)
  })

  addArrowSlider(rankingDOM)

  rankingDOM.querySelector('.loader-wrap').remove()
}

// ランキングカテゴリ毎のカードを横にスライドさせるイベント
$cardGridEl.addEventListener('click', e => {
  // console.log(e.target)

  if (e.target.classList.contains('page-arrow')) {
    let distance = 600
    const arrowEl = e.target

    // 右矢印スライドボタンを押した時の発火
    if (e.target.classList.contains('right-scroll')) {
      const slideContainer = e.target.previousElementSibling.previousElementSibling
      const leftArrow = arrowEl.previousElementSibling

      const xAmount = slideContainer.scrollLeft
      const containerWidth = slideContainer.scrollWidth
      const containerDisplayWidth = slideContainer.clientWidth

      // 右移動が可能な場合
      if (containerDisplayWidth + xAmount < containerWidth) {
        slideContainer.scrollBy({ left: distance, behavior: 'smooth' })
        showArrow(leftArrow)
      } else {
        hideArrow(arrowEl)
      }
    }

    // 左矢印スライドボタンを押した時の発火
    if (e.target.classList.contains('left-scroll')) {
      const slideContainer = e.target.previousElementSibling
      const rightArrow = arrowEl.nextElementSibling
      const xAmount = slideContainer.scrollLeft
      // 左移動が可能な場合
      if (xAmount > 0) {
        slideContainer.scrollBy({ left: -distance, behavior: 'smooth' })
        showArrow(rightArrow)
      } else {
        hideArrow(arrowEl)
      }
    }
  }
})

function hideArrow(element) {
  element.classList.add('hide')
}

function showArrow(element) {
  element.classList.remove('hide')
}

//*カードのイベントを発火する*//
$cardGridEl.addEventListener('click', async e => cardEvent(e))
