import { createCard } from '../../utils/card/createCard.js'

function createRankedCard(content, myId, myAccountName, idx) {
  const cardEl = createCard(content, myId, myAccountName)
  const wrapCardEl = document.createElement('div')
  wrapCardEl.classList.add('cards-wrap')

  wrapCardEl.innerHTML = `
  <p class="rank-number">${idx + 1}</p>
  `
  wrapCardEl.appendChild(cardEl)

  return wrapCardEl
}

function createRankingDOM(categoryName) {
  const rankingEl = document.createElement('div')
  rankingEl.classList.add('ranking-block')

  rankingEl.innerHTML = `
  <h2>${categoryName}</h2>
  <div class="slide-container" id="slide-box">
    
  </div>
  `

  return rankingEl
}

function addArrowSlider(element) {
  const arrowEl = `
  <img src="/img/icon/icon_slideArrow.svg" alt="Move left" class="page-arrow left-scroll hide"></img>
  <img src="/img/icon/icon_slideArrowRight.svg" alt="Move right" class="page-arrow right-scroll"></img>
  `

  element.insertAdjacentHTML('beforeend', arrowEl)
}

export { createRankedCard, createRankingDOM, addArrowSlider }
