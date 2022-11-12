// popup messageを下部に表示する
function showPostingSuccess(message) {
  const postMessageEl = document.createElement('div')
  postMessageEl.classList.add('post-msg-container')

  postMessageEl.innerHTML = `
  <p>${message}</>
  `

  document.querySelector('main').appendChild(postMessageEl)

  setTimeout(() => postMessageEl.remove(), 3000)
}

export { showPostingSuccess }
