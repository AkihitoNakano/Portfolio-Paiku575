import { disableBtn, enableBtn } from './utils/button.js'
import { showBarLoader } from './utils/loader.js'

const submitBtn = document.getElementById('submit')

async function submitEmail(input) {
  // loaderを設置する
  const barLoader = document.querySelector('.bar-loader')
  showBarLoader(barLoader, true)

  const option = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input }),
  }

  const res = await fetch('/user/settings/check-email', option)

  if (res.status === 404) {
    showError('メールアドレスが見つかりませんでした')
    enableBtn(submitBtn)
    return showBarLoader(barLoader, false)
  } else if (res.status === 500) {
    showError('サーバーエラーが発生しました')
    enableBtn(submitBtn)
    return showBarLoader(barLoader, false)
  }

  showBarLoader(barLoader, false)
  document.querySelector('.forget-pass-container').classList.add('hide')
  document.querySelector('.check-your-email').classList.add('show')
}

function showError(message) {
  const messageEl = document.querySelector('.message')
  messageEl.innerText = message
  messageEl.classList.add('show')
}

function checkEmail(input) {
  const re = /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9]*\.[a-z]+(\.[a-z]+)?$/
  if (re.test(input.trim())) {
    submitEmail(input)
  } else {
    showError('メールアドレスが適切ではありません')
    enableBtn(submitBtn)
  }
}

// submitボタンを押したら
submitBtn.addEventListener('click', () => {
  const input = document.getElementById('email').value
  disableBtn(submitBtn)
  checkEmail(input)
})
