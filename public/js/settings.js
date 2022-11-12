import { showAccount } from './subContents/settings/showAccount.js'
import { disableBtn, enableBtn } from './utils/button.js'

const checkPassBtn = document.querySelector('.checkPass-submit')
const passwordInputEl = document.getElementById('check-pass')
const alertEl = document.querySelector('.confirm-alert')

checkPassBtn.addEventListener('click', async e => {
  e.preventDefault()

  const password = passwordInputEl.value
  confirmPass(password)
})

// アカウント情報にアクセスする為にパスワードの確認
async function confirmPass(pass) {
  try {
    const password = { pass }
    const url = '/user/settings/confirm'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(password),
    })

    disableBtn(checkPassBtn)

    if (res.status === 404) {
      enableBtn(checkPassBtn)
      throw new Error('パスワードが合いません')
    }

    const data = await res.json()
    closeAlert(alertEl)
    showAccount(data)

    enableBtn(checkPassBtn)
    passwordInputEl.value = ''
  } catch (err) {
    // エラーメッセージを表示する
    displayAlert('パスワードが一致しません', alertEl)
    console.log(err)
  }
}

function displayMessage(message, messageEl) {
  messageEl.innerText = message
  messageEl.classList.add('show')
}

function displayAlert(message, alertEl) {
  alertEl.innerText = message
  alertEl.classList.add('show')
}

function closeAlert(alertEl) {
  alertEl.classList.remove('show')
}

// アラートを吐き出す
function createAlert(message, alertEl) {
  alertEl.classList.add('show')
  displayAlert(message, alertEl)
}

export { displayAlert, displayMessage, createAlert, closeAlert }
