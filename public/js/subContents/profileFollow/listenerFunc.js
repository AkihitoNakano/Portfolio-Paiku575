import { loadNameCard } from './profileFollowFunc.js'

function registerLoadBtnListener(element, page) {
  element.addEventListener('click', async e => {
    await loadNameCard(page)
  })
}

export { registerLoadBtnListener }
