import { disableBtn, enableBtn } from './utils/button.js'
// import { saveChangedPass } from './subContents/settings/changePass.js'
import { passLength } from './config/application.config.js'

const submitBtn = document.getElementById('submit')
const message = document.querySelector('.message')

submitBtn.addEventListener('click', async e => {
  e.preventDefault
  disableBtn(submitBtn)
  message.classList.remove('show')

  const newPass1 = document.getElementById('old-pass').value
  const newPass2 = document.getElementById('new-pass').value

  if (newPass1 === '' || newPass2 === '') {
    enableBtn(submitBtn)
    return showError('パスワードを記入して下さい')
  }

  if (newPass1 !== newPass2) {
    enableBtn(submitBtn)
    return showError('パスワードが一致しません')
  }

  if (newPass1.length < passLength) {
    enableBtn(submitBtn)
    return showError(`パスワードは${passLength}文字以上必要です`)
  }

  await updatePassword(newPass1)
})

function showError(message) {
  const messageEl = document.querySelector('.message')
  messageEl.innerText = message
  messageEl.classList.add('show')
}

async function updatePassword(pass) {
  disableBtn(submitBtn)
  const hash = location.pathname.split('/')[4]
  const res = await fetch('/user/me/out', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pass, hash }),
  })

  if (res.status === 400) {
    showError('不適切な値が入力されました')
    return enableBtn(submitBtn)
  }

  location = '/'
}
