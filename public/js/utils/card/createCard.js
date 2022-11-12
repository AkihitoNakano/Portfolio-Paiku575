import { dateForCard } from '../date.js'
import { calcExpr } from './calcExp.js'
import { shareBtnToTwitter } from '../share.js'

// カードを作成する
function createCard(content, myId, myAccountName) {
  // 自分のカードかどうか判別する
  let mySelectDOM
  let trashEl
  if (content.accountName === myAccountName) {
    mySelectDOM = `
    <div class="cd-icons">
    <button class="cd-mySelect-button"></button>
    </div>
    `

    trashEl = `
    <div class="op-box trash-grp">
      <div class="op-icon trash"></div>
      <p>削除</p>
    </div>
    `
  } else {
    mySelectDOM = ''
    trashEl = ''
  }

  // commentがあるかどうか
  if (!content.comments) {
    content.comments = []
  }

  // Tagはあるかどうか
  let cardTags
  if (content.tags) {
    cardTags = content.tags
      .map(tag => {
        return `<span class="tag">#${tag}</span>`
      })
      .join('')
  }

  // 自分がfansにしたカードがあるか
  const DoIPressFans = content.fans.some(fan => {
    return fan.user.toString() === myId.toString()
  })
  const isHeartFill = DoIPressFans ? ' fill' : ''

  // カードのレベルを計算する
  const barStyle = calcExpr(content.voted.length, false)
  const levelBar = `<div class="cd-level-bar" style="width:${barStyle.percent}%; background-color:${barStyle.color}" ></div>`

  // カードの画像を設定する
  let image
  if (content.image) {
    image = `<img class="bg-img" src="${content.image}" alt="image" style="background-color:rgba(0,0,0,0.5);">`
  } else {
    image = `<div class="bg-img" style="background-color:#707070"></div>`
  }

  const date = dateForCard(content.date)
  const text = content.description.split('、')

  const cardDOM = document.createElement('div')
  cardDOM.classList.add('cd-pane')
  cardDOM.innerHTML = `
          <div class="cd-base">
            <div class="cd-upper-block" name="${content.accountName}">
              <img src="${content.avatar}" class="self-icon cd-self-icon" alt="avatar">
              <div class="cd-names-container">
                <p class="cd-user-name">${content.displayName}</p>
                <p class="cd-account-name">@${content.accountName}</p>
              </div>
              <p class="cd-post-date">${date}</p>
            </div>

            <div class="cd-center-block">
            ${text[0] ? `<p class='cd-text-1'>${text[0]}</p>` : ``}
            ${text[1] ? `<p class='cd-text-2'>${text[1]}</p>` : ``}
            ${text[2] ? `<p class='cd-text-3'>${text[2]}</p>` : ``}
             
            </div>

            <div class="cd-bottom-block" name="${content.contentId}">
              ${levelBar}
              <div class="cd-reaction-btn">
                <div class="cd-icons">
                  <button class="cd-heart-button${isHeartFill}"></button>
                </div>
                <div class="cd-icons">
                  <button class="cd-up-button"></button>
                </div>
                <div class="cd-icons">
                  <button class="cd-comment-button"></button>
                </div>
                ${mySelectDOM}
                <div class="cd-icons">
                  <button class="cd-option-button"></button>
                </div>
              </div>
            </div>
          </div>

          <div class="cd-back">
            <div class="back-container">
              <div class="tags-container">
                <p>${cardTags}</p>
              </div>
              <div class="back-center"></div>
              <div class="cd-reaction-btn back">
                <div class="back-icons-container">
                  <div class="icon-wrap">
                    <div class="cd-icons back">
                      <button class="back-cd-heart-button"></button>
                    </div>
                      <p class="fans-length">${content.fans.length}</p>
                  </div>
                  <div class="icon-wrap">
                    <div class="cd-icons back">
                      <button class="back-cd-up-button"></button>
                    </div>
                      <p class="vote-length">${content.voted.length}</p>
                  </div>
                  <div class="icon-wrap">
                    <div class="cd-icons back">
                      <button class="back-cd-comment-button"></button>
                    </div>
                      <p>${content.comments.length}</p>
                  </div>

                </div>
              </div>
              ${image}
          </div>

        </div>


        <div class="op-modal">
          <div class="op-wrap">
            ${trashEl}  
            <div class="op-box share-grp">
              <div class="op-icon share"></div>
              <p>共有</p>
            </div>
          </div>
        </div>
        
  
  `

  // center-blockをクリックするとカードにfocusする
  const body = cardDOM.querySelector('.cd-center-block')
  body.addEventListener('click', e => focusCard(e))

  // cd-backをクリックすると元に戻る
  const backPane = cardDOM.querySelector('.back-center')
  backPane.addEventListener('click', e => unFocusCard(e))

  // カードのoptionボタンを選択
  const optionBtn = cardDOM.querySelector('.cd-option-button')
  optionBtn.addEventListener('click', () => {
    showOpModal(cardDOM)
  })

  // カードの登録されているタグを選択
  const tagEl = cardDOM.querySelector('.tags-container')
  if (tagEl !== null) {
    tagEl.addEventListener('click', jumpToTag)
  }

  // 共有ボタンをクリック
  const shareEl = cardDOM.querySelector('.share-grp')
  if (shareEl !== null) {
    shareEl.addEventListener('click', e => {
      // urlのlocalhostを修正
      const url = `https://paiku575.com/home?page=comment&cardId=${content.contentId}`
      const shareUrl = shareBtnToTwitter(content.description, url, ['Paiku', '575'])
      window.open(shareUrl)
    })
  }

  return cardDOM
}

// homeページのtagに移動する
function jumpToTag(e) {
  if (e.target.classList.contains('tag')) {
    const tagName = e.target.textContent.split('#')[1]
    location = `/home?page=topic&tag=${tagName}`
  }
}

// cardをフォーカスした際にイベント
function focusCard(e) {
  const backCard = e.currentTarget.parentNode.nextElementSibling
  backCard.classList.add('show')
}

// cardの裏面を非表示にする
function unFocusCard(e) {
  e.currentTarget.parentNode.parentNode.classList.remove('show')
}

// op modalを表示する
function showOpModal(cardDOM) {
  const opModal = cardDOM.querySelector('.op-modal')
  opModal.classList.add('show')

  opModal.insertAdjacentHTML('afterend', '<div class="back-modal"></div>')

  const modalBack = cardDOM.querySelector('.back-modal')
  // optionのback modalをクリック
  modalBack.addEventListener('click', () => {
    delModal(opModal, modalBack)
  })

  // 削除ボタンを押す
  const trashEl = cardDOM.querySelector('.trash')
  if (trashEl !== null) {
    const trashBtn = trashEl.parentNode
    trashBtn.addEventListener('click', async e => {
      e.preventDefault()
      const cardId = cardDOM.firstElementChild.lastElementChild.getAttribute('name')

      const isDeleted = await delCard(cardId)

      if (!isDeleted) {
        return delModal(opModal, modalBack)
      }

      cardDOM.remove()
      delModal(opModal, modalBack)
    })
  }
}

// optionモーダルを消す
function delModal(opModal, modalBack) {
  modalBack.remove()
  opModal.classList.remove('show')
}

async function delCard(cardId) {
  const res = await fetch(`/content/${cardId}`, { method: 'DELETE' })

  if (res.status === 500) {
    window.alert('カードが削除できませんでした')
    return false
  }

  return true
}

export { createCard, calcExpr }
