import { dateForCard } from '../date.js'

// カードを作成する
function createDemoCard(content) {
  // カードの画像を設定する

  const date = dateForCard(content.date)
  const text = content.description.split('、')

  const cardDOM = document.createElement('div')
  cardDOM.classList.add('cd-pane')
  cardDOM.innerHTML = `
          <div class="cd-base">
            <div class="cd-upper-block" name="${content.accountName}">
              <img src="${
                content.avatar
              }" class="self-icon cd-self-icon" alt="avatar">
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

            <div class="cd-bottom-block">

            </div>

            
          </div>

        </div>
  
  `

  return cardDOM
}

export { createDemoCard }
