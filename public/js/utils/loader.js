function createLoader() {
  const loader = document.createElement('div')
  loader.classList.add('loader-wrap')
  loader.innerHTML = `
    <h4>読み込み中...</h4>
    <div class="loader"></div>
  `
  return loader
}

// barタイプのloaderを表示する
function showBarLoader(element, display) {
  if (display) {
    element.classList.add('show')
  } else {
    element.classList.remove('show')
  }
}

export { createLoader, showBarLoader }
