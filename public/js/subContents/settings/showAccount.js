import { dateAtJapan } from '../../utils/date.js'
import { confirmChangedPass } from './changePass.js'
import { deleteAccount } from './deleteAccount.js'

function showAccount(data) {
  const wrapEl = document.querySelector('.check-account-wrap')
  const accountNode = createNode(data)
  wrapEl.insertAdjacentElement('beforeend', accountNode)
}

function createNode(data) {
  const date = dateAtJapan(data.createdAt)
  const dom = document.createElement('div')

  dom.innerHTML = `
  <div class="display-account">
    <p class="text-title">ユーザアカウント名</p>
    <p class="show-account accountName">@${data.accountName}</p>
    <p class="text-title">メールアドレス</p>
    <p class="show-account email">${data.email}</p>
    <p class="text-title">アカウントの作成日</p>
    <p class="show-account create-day">${date}</p>
  </div>

  <div class="change-pass">
    <h3>パスワードを変更する</h3>
    <small class="alert changePass-alert"></small>
    <small class="message changePass-msg"></small>
    <form onsubmit="return false">
      <input type="password" class="check-pass" id="old-pass" placeholder="新しいパスワードを入力">
      <input type="password" class="check-pass" id="new-pass" placeholder="確認のためもう一度入力して下さい">
      <button class="save-changed-pass">保存</button>
    </form>
  </div>
  <div class="delete-account">
    <h3>アカウントを削除する</h3>
    <div class="explain-del-acc">
      <p>アカウントを削除した場合、すべての投稿カードをはデータベースから削除されます。そのため一度削除した場合復旧することはできません。</p>
      <p>投稿した句はリクエストに応じてダウンロードすることができます。データのアーカイブが欲しい方はこちらからリクエストをお願い致します。</p>
      <u>※現在はご利用いただけません</u>
    </div>
    <button class="request-archive" disabled=true>アーカイブのリクエスト</button>
    <p>以上をご理解いただいた上でアカウントを削除をご希望される場合は以下のボタンを押して削除を完了してください</p>
    <button class="del-acc-btn">アカウントの削除</button>
    <small class="alert del-acc-alert">accountが削除できませんでした。</small>
  </div>
  
  `
  const changePassBtn = dom.querySelector('.save-changed-pass')
  changePassBtn.addEventListener('click', confirmChangedPass)

  const delAccountBtn = dom.querySelector('.del-acc-btn')
  delAccountBtn.addEventListener('click', deleteAccount)

  return dom
}

export { showAccount }
