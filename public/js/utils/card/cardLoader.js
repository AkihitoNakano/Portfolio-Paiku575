// card loaderを追加する
function displayCardLoader(parentEl, length) {
  let loaderDOM = ''
  for (let i = 0; i < length; i++) {
    loaderDOM += loadingCard
  }
  parentEl.insertAdjacentHTML('afterbegin', loaderDOM)
}

function deleteCardLoader() {
  const loaderCards = document.querySelectorAll('.card-loader')
  loaderCards.forEach(loader => loader.remove())
}

const loadingCard = `
<div class='cd-pane card-loader'>
  <div class='loader-base'>
    <div class='loader-upper-block'>
      <div class='loader-circle animated-bg'></div>
      <div class='loader-names-container'>
        <p class='loader-bar-h animated-bg'></p>
        <p class='loader-bar-h animated-bg'></p>
      </div>
    </div>

    <div class='loader-center-block'>
      <p class='loader-bar-v animated-bg'></p>
      <p class='loader-bar-v ldv-center animated-bg'></p>
      <p class='loader-bar-v animated-bg'></p>
    </div>

  </div>
</div>
`

export { displayCardLoader, deleteCardLoader }
