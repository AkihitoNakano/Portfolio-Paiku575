import { jumpToIndexPage } from './subContents/index/indexFunc.js'

const errorField = document.querySelector('.error-container')
const email = document.getElementById('email')
const password = document.getElementById('password')
const loginBtn = document.getElementById('submit')

jumpToIndexPage()

function showError(message) {
  const html = `<p>${message}</p>`
  errorField.insertAdjacentHTML('beforeend', html)
}

function clearErrorField() {
  errorField.innerHTML = ''
}

function isButtonDisabled(isDisable) {
  if (isDisable) {
    loginBtn.setAttribute('disabled', true)
  } else {
    loginBtn.removeAttribute('disabled')
  }
}

function checkFields(inputArr) {
  clearErrorField()
  inputArr.forEach(input => {
    if (input.value.trim() === '') {
      const message = `${input.id}が記入されていません`
      showError(message)
    } else {
      input.classList.add('completed')
    }
  })
}

function checkInputField(inputArr) {
  const isValid = inputArr.every(input => {
    return input.classList.contains('completed')
  })

  if (isValid) sendForm()
}

async function sendForm() {
  isButtonDisabled(true)
  const userData = {
    email: email.value,
    password: password.value,
  }

  try {
    const res = await fetch('/user/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (res.status === 200) {
      location.assign('/')
    } else if (res.status === 400) {
      showError('Emailまたはpasswordが間違っています。')
      isButtonDisabled(false)
    }
  } catch (err) {
    console.log(err)
  }
}

// Event listener
loginBtn.addEventListener('click', e => {
  e.preventDefault()
  checkFields([email, password])

  checkInputField([email, password])
})
