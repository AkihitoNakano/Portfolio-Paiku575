import { registerSearchListener } from './keywordSearch.js'

export const $nav = document.querySelector('nav')
const mainContainer = document.querySelector('.main-container')
const leftSide = document.querySelector('.left-side-container')
const menuBtn = document.querySelectorAll('.menu-btn')

let scrollYPosition = 0
// navをスクロールによって隠したり表示したりする
window.addEventListener('scroll', fixNav)

// 検索ボックスのイベントリスナーへの登録
registerSearchListener(document.getElementById('search'))

function fixNav() {
  if (window.scrollY < $nav.offsetHeight + 100) {
    $nav.classList.remove('hide')
  } else if (scrollYPosition - window.scrollY >= 150) {
    $nav.classList.remove('hide')
    scrollYPosition = window.scrollY
  } else if (scrollYPosition - window.scrollY < -150) {
    $nav.classList.add('hide')
    scrollYPosition = window.scrollY
  }
}

// side barのアイコンリンクを設定
const profileBtn = document.querySelector('.profile-link')
const settingBtn = document.querySelector('.settings-link')
if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    location = `/${profileBtn.getAttribute('name')}`
  })
}

if (settingBtn) {
  settingBtn.addEventListener('click', () => {
    location = `/user/settings`
  })
}

// navバーの最新、ランキング、トピックをクリックしてそれぞれのページへジャンプする
menuBtn.forEach(btn =>
  btn.addEventListener('click', e => {
    const targetEl = e.currentTarget.firstChild
    if (targetEl.classList.contains('latest')) {
      location = '/home'
    } else if (targetEl.classList.contains('ranking')) {
      location = '/ranking'
    } else if (targetEl.classList.contains('theme')) {
      location = '/theme'
    }
  })
)

// mobile用レスポンシブ
const openSideBar = document.querySelector('.mb-others')
openSideBar.addEventListener('click', () => {
  const sideBar = document.querySelector('.mb-side-bar')
  sideBar.classList.add('show')
})

// close side bar
const closeSideBar = document.querySelector('.mb-close')
closeSideBar.addEventListener('click', () => {
  const sideBar = document.querySelector('.mb-side-bar')
  sideBar.classList.remove('show')
})

// show push form
const showPushForm = document.querySelector('.create-card-btn')
if (showPushForm) {
  showPushForm.addEventListener('click', () => {
    document.querySelector('.push-form-container').style.display = 'flex'
  })
}

// close push form
const closePushFormBtn = document.querySelector('.close-push-form')
if (closePushFormBtn) {
  closePushFormBtn.addEventListener('click', () => {
    document.querySelector('.push-form-container').style.display = 'none'
  })
}
