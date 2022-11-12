import { fetchAddMySelect, fetchAddFavCard, fetchRemoveFavCard, fetchAddVote } from '../fetch.js'
import { calcExpr } from './createCard.js'
import { fetchCheckLastTickets } from '../../utils/fetch.js'

// カードの発火イベント
async function cardEvent(e) {
  e.preventDefault()
  // console.log(e.target)

  // カードの作者のプロフィールページへ飛ぶ
  const isAccount = e.target.classList.contains('cd-user-name')
  if (isAccount) {
    const accountName = e.target.parentNode.parentNode.getAttribute('name')
    jumpToProfile(accountName)
  }
  // op-modalを開いている場合、opnのback-modalをクリックしたら空をreturnする
  if (e.target.classList.contains('back-modal')) return

  // ボトムのアイコンボタンを発火
  const button = e.target
  // console.log(button)
  const cardId = button.parentNode.parentNode.parentNode.getAttribute('name')

  // MySelectボタンを押す
  const isMySelect = e.target.classList.contains('cd-mySelect-button')
  if (isMySelect) {
    fetchAddMySelect(cardId)
    animIcon(button)
  }

  // favボタンを押す
  const isFavorite = button.classList.contains('cd-heart-button')
  if (isFavorite) {
    const backCard = button.parentNode.parentNode.parentNode.parentNode.nextElementSibling
    let favLengthEl = backCard.querySelector('.fans-length')

    if (button.classList.contains('fill')) {
      // favを取り消し
      const res = await fetchRemoveFavCard(cardId)
      const length = await res.json()
      button.classList.remove('fill')
      favLengthEl.innerText = length
    } else {
      // favを追加
      const res = await fetchAddFavCard(cardId)
      const length = await res.json()
      button.classList.add('fill')
      favLengthEl.innerText = length
    }
  }
  // voteボタンを押す
  const isVoted = button.classList.contains('cd-up-button')
  if (isVoted) {
    // チケットの残り枚数を確認する
    const haveTickets = await (await fetchCheckLastTickets()).json()
    if (haveTickets === 0) return

    if (!button.classList.contains('fill')) {
      // vote追加
      const res = await fetchAddVote(cardId)
      button.classList.add('fill')
      setTimeout(() => button.classList.remove('fill'), 300)
      const { votedNum, ticketNum } = await res.json()

      //  裏面に投票数を加える
      const cardBack = button.parentNode.parentNode.parentNode.parentNode.nextElementSibling
      let votedLengthEl = cardBack.querySelector('.vote-length')
      votedLengthEl.innerText = votedNum

      // 元から保持するチケット数が0だった場合その後のアクションは起こさない
      if (ticketNum < 0) return
      // ticketの枚数を変更する
      minusTicketCount(ticketNum)

      // level barにアニメーションを加える
      const barStyle = calcExpr(votedNum, true)
      const levelBarEl = e.target.parentNode.parentNode.parentNode.firstElementChild
      if (barStyle.percent === 100) {
        setLevelBar(levelBarEl, barStyle.percent, barStyle.color)
        setTimeout(() => {
          levelBarEl.style.opacity = '0'
          levelBarEl.style.width = '0%'
          // カード全体を振動させる
          const paneEl = e.target.parentNode.parentNode.parentNode.parentNode.parentNode

          paneEl.classList.add('wiggle')
          setTimeout(() => {
            paneEl.classList.remove('wiggle')
            levelBarEl.style.opacity = '1'
          }, 1000)
        }, 500)
      } else {
        // level barのバーを動かす
        setLevelBar(levelBarEl, barStyle.percent, barStyle.color)
      }
    }
  }

  // commentsボタンを押す
  const isComments = button.classList.contains('cd-comment-button')
  if (isComments) {
    const targetCard = button.parentNode.parentNode.parentNode
    const cardId = targetCard.getAttribute('name')
    jumpToSingleCard(cardId)
  }
}

// コメントチェーンのページへ飛ぶ home
function jumpToSingleCard(cardId) {
  location = `/home?page=comment&cardId=${cardId}`
}

// カードのユーザーのプロフィールページへ飛ぶ
function jumpToProfile(accountName) {
  location = `/${accountName}`
}

// mySelect iconのボタンのアニメーション、アニメーションがリターンする
function animIcon(button) {
  button.classList.add('fill')
  setTimeout(() => {
    button.classList.remove('fill')
  }, 200)
}

// level barの長さとスタイルを設定する
function setLevelBar(element, percent, color) {
  element.style.width = `${percent}%`
  element.style.backgroundColor = color
}

// レフトサイドのチケットの数を修正する
function minusTicketCount(ticketNum) {
  document.getElementById('ticket-num').innerHTML = ticketNum
  document.querySelector('.icon-ticket-num').innerHTML = ticketNum
}

export { cardEvent, jumpToProfile }
