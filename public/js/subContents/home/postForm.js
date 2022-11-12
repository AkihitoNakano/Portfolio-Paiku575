import { imageSize } from '../../config/application.config.js'
import { parseQuery, omitText } from '../../utils/docControl.js'
import { displayCards } from './homeFunc.js'
import { showPostingSuccess } from '../../utils/popup.js'
import { createCard } from '../../utils/card/createCard.js'
import { showBarLoader } from '../../utils/loader.js'
import { $cardGridEl } from '../../home.js'

const $pushInput = document.getElementById('push-input')
const $pushBtn = document.getElementById('push-btn')
const $autoCompWrapEl = document.querySelector('.auto-cmp-container')
const $pushErrorText = document.querySelector('#push-error')
const $tagsContainer = document.querySelector('.push-tags-container')
const $loadImage = document.querySelector('#upload-img')

let tags = []
let cardTags = []

pressShortcutKey()

// 文字数が０の場合送信できない
function isLessTextCount() {
  if ($pushInput.value.trim() <= 0) {
    isDisabledButton(true)
  }
}

// DOMにセンテンスのタグを加える
function _addTagToDOM(tag) {
  const tagEl = document.createElement('span')
  tagEl.classList.add('auto-cmp-text')
  _checkTextCount(tag, tagEl)
  tagEl.innerText = tag
  $autoCompWrapEl.appendChild(tagEl)
}

// DOMにcardのTagを加える
function addCardTagToDOM(tag) {
  const tagEl = document.createElement('span')
  tagEl.classList.add('auto-cmp-tag')
  tagEl.innerText = '#' + tag
  $tagsContainer.appendChild(tagEl)
}

//センテンスの文字数をカウントしてオーバーしていればタグが赤色になる
function _checkTextCount(tag, tagEl) {
  if (tag.length > 10) {
    tagEl.classList.add('error')
  }
}

// pushボタンをdisableにするかどうか
function isDisabledButton(isDisabled) {
  if (isDisabled) {
    $pushBtn.setAttribute('disabled', true)
    $pushBtn.classList.add('disabled')
  } else {
    $pushBtn.classList.remove('disabled')
    $pushBtn.removeAttribute('disabled')
  }
}

// errorが出ている時のフォームの処理
function _displayError(checkError, errorMessage) {
  if (checkError) {
    $pushErrorText.innerText = errorMessage
    $pushErrorText.classList.add('visible')
    isDisabledButton(true)
  } else {
    $pushErrorText.classList.remove('visible')
    isDisabledButton(false)
  }
}

// ヘルパー関数、文字数でエラーが出ていればアラートを出す
function _textCountAlert() {
  const createdTags = $autoCompWrapEl.children
  const checkError = Array.from(createdTags).some(tag => tag.classList.contains('error'))
  _displayError(checkError, '文字数を超えています。')
}

// formに入力した文字を分割して配列に入れる
function createTags(input, tagOfCards) {
  cardTags = tagOfCards
  tags = input
    .split(/、|,/g)
    .filter(tag => tag.trim() !== '')
    .map(tag => tag.trim())

  $autoCompWrapEl.innerHTML = ''
  $tagsContainer.innerHTML = ''

  tags.forEach((tag, idx) => {
    if (idx < 3) _addTagToDOM(tag)
  })
  tagOfCards.forEach(tag => addCardTagToDOM(tag))
  _textCountAlert()
}

// #tagがついている場合の処理
function checkCardTag(target) {
  const tagIdx = target.indexOf(' #')
  if (tagIdx === -1) {
    return target
  }
  const text = target.substr(0, tagIdx + 1)
  return text
}

// タグを配列に入れる
function parseCardTag(target) {
  //  (space)#が現れたら以降はタグのみ受付け、#が現れた右の文を取得する
  const tagIdx = target.indexOf(' #')
  if (tagIdx === -1) return []

  const text = target.substr(tagIdx)
  const tags = text
    .split(' ')
    .filter(tag => tag !== '' && tag[0] === '#' && tag[1] !== undefined)
    .map(tag => tag.substr(1))
  const removeDouble = [...new Set(tags)]
  return removeDouble
}

// create form data
function createFormData(page, cardId) {
  const formData = new FormData()
  const date = new Date()
  formData.append('description', tags.join('、'))
  formData.append('date', date.getTime())
  formData.append('tags', cardTags)

  if (page === 'comment') {
    formData.append('commentId', cardId)
  }

  const img = document.getElementById('upload-img').files[0]

  if (img) {
    formData.append('img', img)
  }

  return formData
}

// 句をPOSTする
async function sendText() {
  const barLoader = document.querySelector('.bar-loader')
  try {
    showBarLoader(barLoader, true)

    const { page, cardId } = parseQuery()
    const formData = createFormData(page, cardId)

    const res = await fetch('/content', {
      method: 'POST',
      body: formData,
    })

    if (res.status === 401) {
      window.alert('投稿に失敗しました')
      showBarLoader(barLoader, false)
      isDisabledButton(false)
    }

    const content = await res.json()

    isDisabledButton(false)
    // 一番最初の次にカードを配置する
    if (page === 'comment') {
      displayAfterRoot(content)
    } else {
      displayCards(content, false)
    }

    $pushInput.value = ''
    $autoCompWrapEl.innerHTML = ''
    $tagsContainer.innerHTML = ''
    isLessTextCount()
    $loadImage.value = ''
    checkAddImg()
    showBarLoader(barLoader, false)
    showPostingSuccess('句が投稿されました')
  } catch (e) {
    isDisabledButton(false)
    showBarLoader(barLoader, false)
    console.log(e)
  }
}

// comment rootの直後に配置する
function displayAfterRoot(content) {
  const { myId, myAccountName } = content.pop()
  const cardEl = createCard(content[0], myId, myAccountName)
  const rootCard = $cardGridEl.firstElementChild
  rootCard.insertAdjacentElement('afterend', cardEl)
}

// Event listener
// inputフォームに入力した文字を解析
$pushInput.addEventListener('keyup', e => {
  if (e.target.value.length <= 80) {
    const text = checkCardTag(e.target.value)
    const tags = parseCardTag(e.target.value)
    createTags(text, tags)
    isLessTextCount()
  } else {
    _displayError(true, 'これ以上記入できません')
  }
})

// フォームに入力した文を送信する
$pushBtn.addEventListener('click', e => {
  e.preventDefault()

  isDisabledButton(true)
  sendText()
})

// 画像をinputフォームから選択したらプレビューを表示する
$loadImage.addEventListener('change', e => {
  const file = e.target.files[0]

  let fileName = file.name

  // 拡張子チェック
  if (!file || !fileName.match(/\.(jpg|jpeg|png)$/)) return window.alert('.jpg/.jpeg/.pngのみをサポートしています。')

  // ファイルサイズのチェック, 5M以内であれば
  if (file.size >= 1024 * 1024 * imageSize)
    return window.alert(`投稿する画像は${imageSize}Mb以内のファイルにしてください。`)

  const modalPane = document.querySelector('.modal-preview-img-bg')
  // 画像ファイルの読み込みと表示
  const reader = new FileReader()
  reader.onloadstart = e => {
    modalPane.style.display = 'flex'
    // ローディングを挟む
  }
  reader.onload = e => {
    // ローディングを終える
    document.querySelector('.preview-img').src = e.target.result
  }

  reader.readAsDataURL(file)

  fileName = omitText(file.name, 20)
  modalPane.querySelector('.file-name').innerText = fileName

  const OKBtn = modalPane.querySelector('.img-ok')
  const closeBtn = modalPane.querySelector('.cancel-btn')

  OKBtn.addEventListener('click', e => {
    closeImgPreview(e, modalPane)
    checkAddImg()
  })
  closeBtn.addEventListener('click', e => {
    closeImgPreview(e, modalPane)
    $loadImage.value = ''
    checkAddImg()
  })
})

//プレビューに画像を追加したかどうかでアイコンを表示するかどうか
function checkAddImg() {
  const addedIcon = document.querySelector('.added-img')

  if ($loadImage.value != '') {
    addedIcon.classList.add('show')
  } else {
    addedIcon.classList.remove('show')
  }
}

// 添付イメージのプレビューを閉じる
function closeImgPreview(e, modalPane) {
  e.preventDefault()
  modalPane.style.display = 'none'
}

// Shift + Enterが押されると送信するショートカット
function pressShortcutKey() {
  window.addEventListener('keydown', e => {
    e.preventDefault
    if (e.shiftKey) {
      if (e.key === 'Enter') {
        if (!$pushBtn.getAttribute('disabled')) {
          sendText()
          isDisabledButton(true)
        }
      }
    }
  })
}

export { isLessTextCount }
