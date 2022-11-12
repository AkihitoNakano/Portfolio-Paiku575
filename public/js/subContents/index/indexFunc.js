const logoEl = document.querySelector('.logo')

function jumpToIndexPage() {
  logoEl.addEventListener('click', () => {
    location = '/index'
  })
}

export { jumpToIndexPage }
