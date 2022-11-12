const $cardContainer = document.querySelector('.card-container')

initPage()

// 最初の処理
async function initPage() {
  const res = await fetchTags()
  const data = await res.json()
  displayTags(data)
}

// 画面に表示するタグを取得する
async function fetchTags() {
  return await fetch('/theme/get', { method: 'GET' })
}

function displayTags(data) {
  data.forEach(dateArr => {
    const title = dateArr.pop()

    const gridContainer = createTopicGrid(title)

    dateArr.forEach((tag, idx) => {
      if (idx < 3) {
        const topic = createTopic(tag)
        const grid = gridContainer.querySelector('.theme-grid-1')
        grid.appendChild(topic)
      } else if (idx < 7) {
        const topic = createTopic(tag)
        const grid = gridContainer.querySelector('.theme-grid-2')
        grid.appendChild(topic)
      } else {
        const topic = createTopic(tag)
        const grid = gridContainer.querySelector('.theme-grid-3')
        grid.appendChild(topic)
      }
    })
    $cardContainer.appendChild(gridContainer)
  })
}

function createTopicGrid(title) {
  const gridContainer = document.createElement('dic')
  gridContainer.classList.add('grid-container')

  gridContainer.innerHTML = `
    <h1>${title}</h1>
    <div class="theme-grid-1"></div>
    <div class="theme-grid-2"></div>
    <div class="theme-grid-3"></div>
  `
  return gridContainer
}

function createTopic(tag) {
  const tagContainer = document.createElement('div')
  tagContainer.classList.add('theme-tag-container')

  let tagName = tag.name
  tagContainer.setAttribute('name', tagName)
  if (tagName.length >= 10) {
    tagName = tagName.substr(0, 10) + '...'
  }
  tagContainer.innerHTML = `    
      <p class="theme-tag">#${tagName}</p>
      <div class="show-post-container">
        <p>投稿数</p>
        <p class="post-num">${tag.length}件</p>
      </div>
  `

  // topicをクリックする
  tagContainer.addEventListener('click', e => {
    const tagName = e.currentTarget
    if (!tagName.classList.contains('theme-tag-container')) return
    const name = tagName.getAttribute('name')
    jumpToDisplayCards(name)
  })

  return tagContainer
}

// homeページに移動する
function jumpToDisplayCards(name) {
  location = `/home?page=topic&tag=${name}`
}

// event listener
