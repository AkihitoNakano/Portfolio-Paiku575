function disableBtn(btnEl) {
  btnEl.disabled = true
}

function enableBtn(btnEl) {
  btnEl.disabled = false
}

// カードを追加読み込み
function loadCard() {
  const loadCardDOM = document.createElement('div')
  loadCardDOM.classList.add('load-card-container')

  loadCardDOM.innerHTML = `
  <div class="load-card-btn"> - 句を読み込む - </div>
  `
  return loadCardDOM
}

// 読込ローダーを表示する
function showLoader(element) {
  element.classList.add('loader')
}
// ローダーを消す
function closeLoader(element) {
  element.classList.remove('loader')
}

// 追加読み込みボタンの全削除
function deleteLoadBtn() {
  const loadBtn = document.querySelectorAll('.load-card-container')
  loadBtn.forEach(btn => btn.remove())
}

export {
  disableBtn,
  enableBtn,
  loadCard,
  deleteLoadBtn,
  showLoader,
  closeLoader,
}
