import { profileFollowLimit as limit } from './config/application.config.js'

import { parseQuery } from './utils/docControl.js'
import { fetchFollowUsers, fetchUnfollowUser, fetchFollowUser } from './utils/fetch.js'
import { layoutCard, setLoadUserBtn } from './subContents/profileFollow/profileFollowFunc.js'
import { createLoader } from './utils/loader.js'

export const $nameCardsGrid = document.querySelector('.name-cards-container')
const $targetUserBtn = document.querySelector('.target-displayName')
const $followsBtn = document.getElementById('follows-btn')
const $followersBtn = document.getElementById('followers-btn')

export let skip = 0

initPage()

// urlクエリを分解してfollowsかfollowersのページか判別する
function checkQuery(page) {
  if (page === 'follows' || page === 'followers') {
    return page
  } else return 'follows'
}

async function initPage() {
  const loader = preDisplayLoader()
  let { page } = parseQuery()
  page = checkQuery(page)

  if (page === 'follows') {
    $followsBtn.classList.add('select')
  } else if (page === 'followers') {
    $followersBtn.classList.add('select')
  }

  const userLen = await getFollowUser(page)
  loader.remove()

  if (userLen < limit) return loader.remove()

  setLoadUserBtn(page)
  pageIncrement()
}

// フォローしている、されているユーザーを取得する。
async function getFollowUser(page) {
  const res = await fetchFollowUsers(page, limit, skip)

  const { users, me } = await res.json()
  layoutCard(users, me)
  return users.length
}

// pageをインクリメントする
export function pageIncrement() {
  return skip++
}

// ローダーを表示する
function preDisplayLoader() {
  const loader = createLoader()
  const cardContainer = document.querySelector('.profile-followers-container')
  cardContainer.insertAdjacentElement('beforeend', loader)
  return loader
}

//　ボタンをdisableにする
function buttonDisabled() {
  const buttonList = Array.from(document.querySelectorAll('button'))
  buttonList.forEach(button => button.setAttribute('disabled', 'disabled'))
}

// ボタンをenableにする
function buttonEnabled() {
  const buttonList = Array.from(document.querySelectorAll('button'))
  buttonList.forEach(button => button.removeAttribute('disabled'))
}

// add EventListener
// フォローの切り替え
$followsBtn.addEventListener('click', e => {
  e.preventDefault()
  const { page } = parseQuery()
  if (page === 'followers') {
    location = `/follow/${location.pathname.split('/')[2]}?page=follows`
  }
})

//フォロワーへの切り替え
$followersBtn.addEventListener('click', e => {
  e.preventDefault()
  const { page } = parseQuery()
  if (page === 'follows') {
    location = `/follow/${location.pathname.split('/')[2]}?page=followers`
  }
})

// ターゲットのユーザーのプロフィールページへ飛ぶ
$targetUserBtn.addEventListener('click', () => {
  const url = `/${location.pathname.split('/')[2]}`
  location = url
})

// Name Card内でのクリックイベント
$nameCardsGrid.addEventListener('click', e => {
  // console.log(e.target)
  e.preventDefault
  const isName = e.target.classList.contains('nc-user-displayName')

  //　name cardの名前をクリックするとそのユーザーのプロフィールへと飛ぶ
  if (isName) {
    const accountName = e.target.parentNode.parentNode.parentNode.parentNode.getAttribute('name')
    return (location = `/${accountName}`)
  }

  // フォロー解除ボタン
  const isUnfollow = e.target.classList.contains('unfollow-btn')
  if (isUnfollow) {
    buttonDisabled()
    const accountName = e.target.parentNode.parentNode.getAttribute('name')
    unfollowUser(accountName, e.target)
  }

  // フォローボタン
  const isFollow = e.target.classList.contains('follow-btn')
  if (isFollow) {
    buttonDisabled()
    const accountName = e.target.parentNode.parentNode.getAttribute('name')
    followUser(accountName, e.target)
  }
})

// ユーザーをアンフォローする　fetch
async function unfollowUser(accountName, button) {
  await fetchUnfollowUser(accountName)

  button.classList.remove('unfollow-btn')
  button.classList.add('follow-btn')
  button.innerText = 'フォロー'
  buttonEnabled()
}

// ユーザーをフォローする fetch
async function followUser(accountName, button) {
  await fetchFollowUser(accountName)

  button.classList.remove('follow-btn')
  button.classList.add('unfollow-btn')
  button.innerText = 'フォロー解除'
  buttonEnabled()
}
