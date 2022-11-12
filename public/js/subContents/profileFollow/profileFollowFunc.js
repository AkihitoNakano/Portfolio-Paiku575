import { profileFollowLimit as limit } from '../../config/application.config.js'
import { $nameCardsGrid, skip, pageIncrement } from '../../profileFollowers.js'
import { fetchFollowUsers } from '../../utils/fetch.js'
import { deleteLoadBtn, loadCard, showLoader, closeLoader } from '../../utils/button.js'
import { createNameCard } from '../../utils/card/nameCard.js'
import { showAlert } from '../../utils/docControl.js'
import { registerLoadBtnListener } from './listenerFunc.js'

let loadBtn

// name cardを配置する
function layoutCard(data, me) {
  data.forEach(content => {
    const cardEl = createNameCard(content, me)
    $nameCardsGrid.appendChild(cardEl)
  })
}

// 追加読み込みボタンを設置する
function setLoadUserBtn(page) {
  // カードを追加読み込み
  loadBtn = loadCard()
  const parentEl = document.querySelector('.profile-followers-container')
  parentEl.insertAdjacentElement('beforeend', loadBtn)

  registerLoadBtnListener(loadBtn, page)
}

// name cardを読み込んで表示する
async function loadNameCard(page) {
  showLoader(loadBtn.firstElementChild)
  const res = await fetchFollowUsers(page, limit, skip)
  showAlert(res.status)
  const { users, me } = await res.json()

  // 読み込むカードがない場合
  if (users.length < 1) return deleteLoadBtn()
  // 残りのカードがlimit数以下だった場合
  if (users.length < limit) {
    layoutCard(users, me)
    return deleteLoadBtn()
  }

  layoutCard(users, me)
  pageIncrement(page)
  closeLoader(loadBtn.firstElementChild)
}

export { layoutCard, loadNameCard, setLoadUserBtn }
