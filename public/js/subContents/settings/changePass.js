import { displayAlert, createAlert, displayMessage, closeAlert } from '../../settings.js'
import { disableBtn, enableBtn } from '../../utils/button.js'

function confirmChangedPass(e) {
  e.preventDefault

  const newPass1 = document.getElementById('old-pass').value
  const newPass2 = document.getElementById('new-pass').value
  const alertEl = document.querySelector('.changePass-alert')

  closeAlert(alertEl)

  if (newPass1 === '' || newPass2 === '') {
    return createAlert('パスワードを記入して下さい', alertEl)
  }

  if (newPass1 !== newPass2) {
    return createAlert('パスワードが一致しません', alertEl)
  }
  const needPassLength = 6

  if (newPass1.length < needPassLength) {
    return createAlert(`パスワードは${needPassLength}文字以上必要です`, alertEl)
  }

  saveChangedPass(newPass1, alertEl, this)
}

async function saveChangedPass(pass, alertEl, btn) {
  const url = '/user/me'
  disableBtn(btn)
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pass }),
  })

  if (res.status === 400) {
    console.log(res)
    displayAlert('不正なアクセスです', alertEl)
    enableBtn(btn)
  }
  const messageEl = document.querySelector('.changePass-msg')
  displayMessage('変更が保存されました', messageEl)
  enableBtn(btn)
}

export { confirmChangedPass }
