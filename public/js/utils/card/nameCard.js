// ネームカードの作成
function createNameCard(content, me) {
  let followBtn
  if (content.accountName === me.myAccountName) {
    followBtn = ''
  } else if (content.isFollow) {
    followBtn = '<button class="unfollow-btn">フォロー解除</button>'
  } else {
    followBtn = '<button class="follow-btn">フォローする</button>'
  }

  let mySelect
  if (!content.mySelect) {
    mySelect = `<p>この場所で</p><p>自分の一句が</p><p>見られるよ</p>`
  } else {
    const list = content.mySelect.split('、')
    mySelect = list
      .map(text => {
        return `<p>${text}</p>`
      })
      .join(' ')
  }

  // 自己紹介文が規定の文字数を超えていた場合...にする
  let selfIntroduction = content.selfIntroduction
  if (selfIntroduction.length > 35) {
    selfIntroduction = `${selfIntroduction.substr(0, 35)}...`
  }

  const card = document.createElement('div')
  card.classList.add('name-card-pane')
  card.innerHTML = `
  <div class="wrap-sentence">
    <div id="select-one">
      ${mySelect}
    </div>
  </div>
  <div class="user-profile" name="${content.accountName}">
    <div class="wrap-user-head">
      <img class="self-icon" src="${content.avatar}" alt="${content.displayName}">
      <div class="user-names">
        <p><strong class="nc-user-displayName">${content.displayName}</strong></p>
        <p class="account-name">@${content.accountName}</p>
      </div>
    </div>
    <div class="user-intro-wrap">
      <p id="name-card-intro">${selfIntroduction}</p>
    </div>
    <div class="card-bottom">
      ${followBtn}
    </div>
  </div>
  
  `
  return card
}

export { createNameCard }
