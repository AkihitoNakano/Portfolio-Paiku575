document.querySelector('.logo').addEventListener('click', () => (location = '/'))

const submitBtn = document.getElementById('submit')

if (submitBtn) {
  submitBtn.addEventListener('click', async e => {
    e.preventDefault

    const submitBtn = e.currentTarget

    let message = document.querySelector('.message')
    message.classList.remove('ok')
    message.classList.remove('alert')
    message.innerHTML = ''

    disableBtn(submitBtn, true)
    const name = document.getElementById('name-input')
    const contact = document.getElementById('contact')
    const content = document.getElementById('content')

    const isValid = checkForm([name.value, content.value])

    if (!isValid) {
      message.innerHTML = '空入力の項目があります'
      message.classList.add('alert')
      disableBtn(submitBtn, false)
      return
    }

    const result = await fetch('/index/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name.value, content: content.value, contact: contact.value }),
    })

    if (result.status === 204) {
      message.classList.add('ok')
      message.innerHTML = 'お問合せ内容がが送信されました'
      name.value = ''
      contact.value = ''
      content.value = ''
    } else if (result.status === 400) {
      message.classList.add('alert')
      message.innerHTML = 'データが送信できませんでした'
    } else if (result.status === 401) {
      location = '/user/login'
    }

    disableBtn(submitBtn, false)
  })
}

const checkForm = array => {
  return array.every(content => {
    return content.length > 0
  })
}

const disableBtn = (button, isDisable) => {
  if (isDisable) {
    return (button.disabled = true)
  }
  return button.removeAttribute('disabled')
}
