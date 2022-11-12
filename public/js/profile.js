import { profileLimit as limit, favLimit } from './config/application.config.js'
import { setVotedList } from './subContents/profile/vote.js'
import { cardEvent } from './utils/card/cardEventFire.js'
import { getCardContents, getUserFavContents, getUserVotedContents } from './utils/fetch.js'
import { logout, logoutAll } from './utils/logout.js'
import {} from './subContents/profile/updateProfile.js'
import { displayCards, setLoadCardBtn } from './subContents/profile/profileFunc.js'
import { parseQuery } from './utils/docControl.js'
import { displayCardLoader, deleteCardLoader } from './utils/card/cardLoader.js'
import { createLoader } from './utils/loader.js'

export const $cardGridEl = document.querySelector('.card-grid')
const logoutBtn = document.getElementById('logout')
const logoutAllBtn = document.getElementById('logoutAll')
const updateProfileBtn = document.getElementById('update-profile')
const modalBack = document.getElementById('mdl-setting-background')
const modalUpdateProfile = document.getElementById('modal-profile-update-bg')
const updateProfileModalCloseBtn = document.getElementById('update-profile-close-btn')

const selfIntroTextInput = document.getElementById('self-intro-input')
const selfIntroTextCount = document.getElementById('input-count')
const selfDisplayNameInput = document.getElementById('update-name-input')
const selfDisplayNameCount = document.getElementById('input-count-name')
const selfPlaceInput = document.getElementById('update-place-input')
const selfPlaceCount = document.getElementById('input-count-place')

const $customBtn = document.querySelector('.custom-btn')
const $followsEl = document.getElementById('follow-number')
const $followersEl = document.getElementById('followed-number')
const $rankEl = document.getElementById('rank-number')
const $selfPosted = document.getElementById('profile-contents')
const $selfFavs = document.getElementById('hearts')
const $selfVoted = document.getElementById('votes')
// スクリプト内で使用しているutilsにあるスクリプトはHTMLに直接追加している

export let skip = 0
export let favSkip = 0

initPage()

// 句、お気に入り、投票した、からどれが選択されているか
function setActiveCardButton(element) {
  $selfPosted.classList.remove('active')
  $selfFavs.classList.remove('active')
  $selfVoted.classList.remove('active')
  element.classList.add('active')
}

// initialize user data
async function initPage() {
  try {
    const { page } = parseQuery()
    if (page === 'vote') {
      const loader = preDisplayLoader()
      setActiveCardButton($selfVoted)
      const contents = await (await getUserVotedContents()).json()
      setVotedList(contents)
      loader.remove()
    } else if (page === 'fav') {
      displayCardLoader($cardGridEl, favLimit)
      setActiveCardButton($selfFavs)
      const contents = await (await getUserFavContents(favLimit, favSkip)).json()

      displayCards(contents)
      deleteCardLoader()
      if (contents.length < favLimit) return

      setLoadCardBtn()
      pageIncrement('fav')
    } else {
      displayCardLoader($cardGridEl, limit)
      setActiveCardButton($selfPosted)
      const contents = await (await getCardContents(limit, skip)).json()

      displayCards(contents)
      deleteCardLoader()
      if (contents.length < favLimit) return

      setLoadCardBtn()
      pageIncrement('self')
    }
  } catch (err) {
    console.log(err)
  }
}

// pageをインクリメントする
export function pageIncrement(type) {
  if (type === 'fav') return favSkip++
  if (type === 'self') return skip++
}

// ローダーを表示する
function preDisplayLoader() {
  const loader = createLoader()
  const cardContainer = document.querySelector('.card-container')
  cardContainer.insertAdjacentElement('beforeend', loader)
  return loader
}

// show hide modal pane
function hideSettingModal() {
  modalBack.classList.remove('show-modal')
}

function showSettingModal(x, y) {
  const modalSettingPane = modalBack.firstChild.nextSibling
  modalSettingPane.style.top = `${y}px`
  modalSettingPane.style.left = `${x - 90}px`
  modalBack.classList.add('show-modal')
}

function hideUpdateModal() {
  modalUpdateProfile.classList.remove('show-modal')
}
function showUpdateModal() {
  modalUpdateProfile.classList.add('show-modal')
}

function buttonDisabled() {
  $customBtn.setAttribute('disabled', 'disabled')
}

function buttonEnabled() {
  $customBtn.removeAttribute('disabled')
}

// Event listener
// 句、お気に入り、投票したのボタンを押す
$selfPosted.addEventListener('click', () => {
  location = `/${location.pathname.split('/')[1]}`
})
$selfFavs.addEventListener('click', () => {
  location = `/${location.pathname.split('/')[1]}?page=fav`
})
$selfVoted.addEventListener('click', () => {
  location = `/${location.pathname.split('/')[1]}?page=vote`
})

updateProfileModalCloseBtn.addEventListener('click', () => {
  hideUpdateModal()
})

// show profile update modal container
updateProfileBtn.addEventListener('click', () => {
  showUpdateModal()
  hideSettingModal()
  selfIntroTextCount.innerText = selfIntroTextInput.value.length
  selfDisplayNameCount.innerText = selfDisplayNameInput.value.length
  selfPlaceCount.innerText = selfPlaceInput.value.length
})

// Hide update profile modal on outside click
window.addEventListener('click', e => {
  e.target === modalUpdateProfile ? hideUpdateModal() : false
})

// 右上のボタンを設定ボタンかフォローボタンかフォロー解除かによって押した後の処理を変える
$customBtn.addEventListener('click', async e => {
  if ($customBtn.classList.contains('settings-btn')) {
    return showSettingModal(e.pageX, e.pageY)
  }

  const url = `/follow/${location.pathname.split('/')[1]}`
  if ($customBtn.classList.contains('follow')) {
    try {
      buttonDisabled()
      await fetch(url, { method: 'POST' })
      location.reload()
    } catch (err) {
      buttonEnabled()
      console.log(err)
    }
  }
  if ($customBtn.classList.contains('unfollow')) {
    try {
      buttonDisabled()
      await fetch(url, { method: 'DELETE' })
      location.reload()
    } catch (err) {
      buttonEnabled()
      console.log(err)
    }
  }
})

// Hide setting modal on outside click
window.addEventListener('click', e => {
  e.target === modalBack ? hideSettingModal() : false
})

// 入力した文字数をカウントする
function countTextInput(length, maxLen, countEl) {
  if (length >= maxLen) {
    countEl.innerText = maxLen
    return countEl.classList.add('over')
  }
  countEl.innerText = length
  countEl.classList.remove('over')
}

// 自己紹介文を入力したらカウント
selfIntroTextInput.addEventListener('input', e => {
  countTextInput(e.target.value.length, 140, selfIntroTextCount)
})
// displayNameを入力したらカウント
selfDisplayNameInput.addEventListener('input', e => {
  countTextInput(e.target.value.length, 12, selfDisplayNameCount)
})
// placeを入力したらカウント
selfPlaceInput.addEventListener('input', e => {
  countTextInput(e.target.value.length, 30, selfPlaceCount)
})

// logout
logoutBtn.addEventListener('click', logout)
// 全ての端末からログアウトする
logoutAllBtn.addEventListener('click', logoutAll)

// ユーザーのフォローページを開く
$followsEl.addEventListener('click', () => {
  const url = `/follow/${location.pathname.split('/')[1]}?page=follows`
  location = url
})

// ユーザーのフォロワーページを開く
$followersEl.addEventListener('click', () => {
  const url = `/follow/${location.pathname.split('/')[1]}?page=followers`
  location = url
})

// カード内の発火イベント
$cardGridEl.addEventListener('click', async e => cardEvent(e))
