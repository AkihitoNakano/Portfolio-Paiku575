// 文字を省略する
function omitText(text, omitLength) {
  if (text.length > omitLength) {
    return `${text.substr(0, omitLength)}...`
  } else {
    return text
  }
}

// queryを解析する
function parseQuery() {
  const searchParams = new URLSearchParams(window.location.search)
  const page = searchParams.get('page')
  const tag = searchParams.get('tag')
  const cardId = searchParams.get('cardId')

  return { page, tag, cardId }
}

// window alertを出す
function showAlert(status) {
  if (status === 404) {
    setLoadCardBtn()
    return window.alert('カードが見つかりませんでした')
  } else if (status === 500) {
    setLoadCardBtn()
    return window.alert('カードがロードできませんでした')
  } else if (status === 400) {
    return window.alert('不正なリクエストです')
  } else {
    return
  }
}

export { omitText, parseQuery, showAlert }
