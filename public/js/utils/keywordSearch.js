import { fetchSearchUser } from './fetch.js'
import { createLoader } from './loader.js'

const searchModalEl = document.querySelector('.md-search-list')
const modalBack = document.querySelector('.md-search-black')
const addLoadCardEl = document.querySelector('.search-next')

const limit = 5
let skip = 0
let inputText = ''

registerSearchNextListener()

// ユーザー情報をフェッチする
async function searchUser(input, isNew) {
  try {
    const res = await fetchSearchUser(input, limit, skip)
    if (!res.status === 200) return

    const data = await res.json()

    // 新規一発目の検索か追加の読み込みか
    // fetchで返ってきたデータの長さによって対応を変える
    addLoadCardEl.classList.add('show')
    if (isNew) {
      if (data.length === 0) {
        const text = '<p class="search-error">検索結果0件です。</p>'
        searchModalEl.innerHTML = ''
        searchModalEl.insertAdjacentHTML('afterbegin', text)
        addLoadCardEl.classList.remove('show')
        return
      } else if (data.length < limit) {
        searchModalEl.innerHTML = ''
        addLoadCardEl.classList.remove('show')
      }
    } else {
      if (data.length === 0) {
        searchModalEl.querySelector('.loader-wrap').remove()
        return addLoadCardEl.classList.remove('show')
      } else if (data.length < limit) {
        addLoadCardEl.classList.remove('show')
      }
    }

    let fragment = new DocumentFragment()

    for (const user of data) {
      const { accountName, avatar, displayName, selfIntro } = user
      const list = createUserList(accountName, displayName, avatar, selfIntro)
      fragment.appendChild(list)
    }

    if (isNew) {
      searchModalEl.innerHTML = ''
    } else {
      searchModalEl.querySelector('.loader-wrap').remove()
    }
    searchModalEl.appendChild(fragment)
    return skip++
  } catch (err) {
    console.log(err)
  }
}

// search boxにwordが決定
async function readInput(input) {
  if (input.trim().length === 0) {
    searchModalEl.innerHTML = ''
    return hideModal()
  }

  skip = 0
  inputText = input
  await searchUser(inputText, true)
}

// 検索欄に入力のイベントリスナーを登録する
function registerSearchListener(element) {
  element.addEventListener('keydown', e => {
    e.preventDefault
    if (e.key !== 'Enter') return
    if (element.value === inputText) return
    showLoader('afterbegin')
    showModal()
    readInput(element.value)
  })
}

// search boxに載るユーザーリストの雛形
function createUserList(accountName, displayName, avatar, selfIntro) {
  let selfIntroduction = selfIntro
  if (selfIntroduction.length > 10) {
    selfIntroduction = selfIntroduction.slice(0, 10) + '...'
  }
  const userEl = document.createElement('div')
  userEl.classList.add('search-user')
  userEl.innerHTML = `
    <img src=${avatar}></img>
    <div class='search-text-list'>
      <p class="search-display-name">${displayName}</p>
      <p class="search-account-name">@${accountName}</p>
      <p class="search-selfIntroduction">${selfIntroduction}</p>
    </div> 
  `
  registerUserListener(userEl)
  return userEl
}

// modal backをクリックしたら検索結果を消す
window.addEventListener('click', e => {
  e.target === modalBack ? hideModal() : false
})

// 検索欄のユーザーをクリックしたらプロフィールページへ飛ぶ
function registerUserListener(element) {
  element.addEventListener('click', e => {
    e.preventDefault
    const body = e.currentTarget
    const accountName = body
      .querySelector('.search-account-name')
      .innerText.slice(1)

    location = `/${accountName}`
  })
}

function showModal() {
  modalBack.classList.add('show')
}

function hideModal() {
  modalBack.classList.remove('show')
  searchModalEl.innerHTML = ''
}

// 更に読み込むボタンを追加する
function showLoader(insertWhere) {
  const loader = createLoader()
  loader.style.marginTop = 0
  searchModalEl.insertAdjacentElement(insertWhere, loader)
}

// 追加読み込みをクリックのイベントリスナーを追加する
function registerSearchNextListener() {
  addLoadCardEl.addEventListener('click', e => {
    showLoader('beforeend')
    searchUser(document.getElementById('search').value, false)
  })
}

export { registerSearchListener }
