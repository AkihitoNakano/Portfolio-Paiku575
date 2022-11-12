import { jumpToIndexPage } from './subContents/index/indexFunc.js'

const form = document.getElementById('form')
const username = document.getElementById('username')
const email = document.getElementById('email')
const password = document.getElementById('password')
const password2 = document.getElementById('password2')

jumpToIndexPage()
// Show input error massage
const showError = (input, message) => {
  const formControl = input.parentElement
  formControl.className = 'form-control error'
  const small = formControl.querySelector('small')
  small.innerText = message
}

// Show success outline
const showSuccess = input => {
  const formControl = input.parentElement
  formControl.className = 'form-control success'
}

// Check email is valid
const checkEmail = input => {
  const re = /^[a-z][a-zA-Z0-9_.]*(\.[a-zA-Z][a-zA-Z0-9_.]*)?@[a-z][a-zA-Z-0-9]*\.[a-z]+(\.[a-z]+)?$/
  if (re.test(input.value.trim())) {
    showSuccess(input)
  } else {
    showError(input, 'メールアドレスが適切ではありません')
  }
}

// Check required fields
const checkRequired = inputArr => {
  inputArr.forEach(input => {
    if (input.value.trim() === '') {
      showError(input, `${getFieldName(input)} を入力して下さい`)
    } else {
      showSuccess(input)
    }
  })
}

// Check passwords match
const checkPasswordsMatch = (input1, input2) => {
  if (input1.value !== input2.value) {
    showError(input2, 'パスワードがマッチしません')
  }
}

// Get fieldname
const getFieldName = input => {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1)
}

// Check input length
const checkLength = (input, min, max) => {
  if (!checkIsWrittenByEnglish(input)) {
    return showError(input, '半角英数字で入力してください')
  }
  if (input.value.length < min) {
    showError(input, `${getFieldName(input)}は少なくとも ${min} 文字以上で入力して下さい`)
  } else if (input.value.length > max) {
    showError(input, `${getFieldName(input)}は${max}文字以下で入力して下さい`)
  } else {
    showSuccess(input)
  }
}
// check is text used only english and symbol
const checkIsWrittenByEnglish = input => {
  const re = /^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/
  if (re.test(input.value.trim())) {
    return true
  }
  return false
}

// Validate all form contents are success
function checkFormValidation(inputArr) {
  const isValid = inputArr.every(input => {
    const formControl = input.parentElement
    return formControl.className === 'form-control success'
  })
  if (isValid) sendForm()
}

// Disable to push button after submit
function buttonDisabled(bool) {
  const button = document.getElementById('submit')
  if (bool) {
    button.setAttribute('disabled', true)
  } else {
    button.removeAttribute('disabled')
  }
}

// Show error message from server
function displayError(errs) {
  const errors = errs
    .map(err => {
      const key = Object.keys(err)[0]
      const value = Object.values(err)[0]
      return `${key}: ${value}`
    })
    .join('/n')
  window.alert(errors)
}

function showMessage() {
  document.querySelector('.container').remove()
  const messageEl = `
  <h2 style="margin-top:200px;">確認用のメールを入力したメールアドレスへ送信しました</h2>
  <h2>メールアドレスから手続きを進めてアカウントを有効にして下さい。</h2>
  <p>一定時間経過してもメールが届いていない場合は迷惑メールフォルダに入っている可能性があります</p> 
  `
  document.querySelector('main').insertAdjacentHTML('beforeend', messageEl)
}

// Send form data
async function sendForm() {
  buttonDisabled(true)
  const userData = {
    accountName: username.value,
    email: email.value,
    password: password.value,
  }
  try {
    const res = await fetch('/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (res.status === 201) {
      showMessage()
    } else if (res.status === 400) {
      const errData = await res.json()
      displayError(errData)
      buttonDisabled(false)
    }
  } catch (err) {
    throw new Error('Server error, something goes wrong, sorry...: ', err)
  }
}

// Event listeners
form.addEventListener('submit', function (e) {
  e.preventDefault()

  checkRequired([username, email, password, password2])
  checkLength(username, 3, 15)
  checkLength(password, 6, 15)
  checkEmail(email)
  checkPasswordsMatch(password, password2)

  checkFormValidation([username, email, password, password2])
})
