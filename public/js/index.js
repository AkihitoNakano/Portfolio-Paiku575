import { jumpToIndexPage } from './subContents/index/indexFunc.js'
import { createDemoCard } from './utils/card/demoCard.js'
import { fetchRankingData } from './utils/fetch.js'

const createAccountBtn = document.getElementById('sign-up')

jumpToIndexPage()
initPage()

async function initPage() {
  const res = await fetchRankingData('today', 4)
  const data = await res.json()
  const title = data.pop()

  document.querySelector('.ranking-title').textContent = '今日の四選'

  displayCards(data)
}

function displayCards(contents) {
  const $cardGridEl = document.querySelector('.card-wrap')
  contents.forEach(content => {
    const cardEl = createDemoCard(content)
    $cardGridEl.appendChild(cardEl)
  })
}

createAccountBtn.addEventListener('click', () => {
  location = '/user/signup'
})
