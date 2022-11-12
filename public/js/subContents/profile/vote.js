import { dateAtJapan } from '../../utils/date.js'
import { jumpToProfile } from '../../utils/card/cardEventFire.js'

const $cardContainer = document.querySelector('.card-container')

// initialize display voted list
function setVotedList(contents) {
  const votedListEl = document.createElement('div')
  votedListEl.classList.add('voted-list-container')
  $cardContainer.appendChild(votedListEl)
  contents.forEach(contents => {
    const listEl = createVotedElement(contents)
    votedListEl.appendChild(listEl)
  })
}

// voted list内の発火イベント
$cardContainer.addEventListener('click', e => {
  // profileユーザーのページへ飛ぶ
  const isAccountName = e.target.classList.contains('display-name')

  if (isAccountName) {
    const targetAccount = e.target.parentNode.getAttribute('name')
    jumpToProfile(targetAccount)
  }
})

// 投票リストを作成
function createVotedElement(contents) {
  const description = contents.description.replace('、', '　')
  const date = dateAtJapan(contents.date)
  const listEl = document.createElement('div')
  listEl.classList.add('vote-column')
  listEl.innerHTML = `
  <div class="user-container">
    <img src="${contents.avatar}" class="self-icon"></img>
    <div class="names-wrap" name="${contents.accountName}">
      <p class="display-name">${contents.displayName}</p>
      <p class="vote-account-name">@${contents.accountName}</p>
    </div>
  </div>
  <div class="sentence-container">
    <p>${description}</p>
  </div>
  <div class="voted-date">${date}</div>
  `

  return listEl
}

export { setVotedList }
