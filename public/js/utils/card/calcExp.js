// カードの経験値を計算する
function calcExpr(votedNum, isActive) {
  // baseは次のレベルまでの経験値
  // xはレベル
  // sumは現在のレベルまでの経験値の総和
  // currentExprは現在の経験値、VotedNumから以前のレベルまでの経験値の総和を引いたもの
  let base
  let x = 0
  let sum = 0
  let currentExpr
  let barStyle = { percent: 0, color: '' }

  while (true) {
    if (sum < votedNum) {
      x += 1
      sum += 2 ** x
    } else {
      currentExpr = votedNum - (sum - 2 ** x)
      currentExpr = currentExpr <= 0 ? 0 : currentExpr
      break
    }
  }
  switch (x - 1) {
    case 0:
      barStyle.color = 'green'
      break
    case 1:
      barStyle.color = 'navy'
      break
    case 2:
      barStyle.color = 'blue'
      break
    case 3:
      barStyle.color = 'teal'
      break
    case 4:
      barStyle.color = 'blueviolet'
      break
    case 5:
      barStyle.color = 'coral'
      break
    case 6:
      barStyle.color = 'crimson'
      break
    default:
      barStyle.color = 'deeppink'
      break
  }
  base = 2 ** x
  const percent = (currentExpr / 2 ** x) * 100

  // 投票ボタンを押してMaxまで到達した場合は100になる、初期の配置時は100は0になる
  if (isActive) {
    if (currentExpr === base) {
      barStyle.percent = 100
    } else {
      barStyle.percent = percent
    }
  } else {
    if (votedNum === 0 || currentExpr === base) {
      barStyle.percent = 0
    } else {
      barStyle.percent = percent
    }
  }

  return barStyle
}

export { calcExpr }
