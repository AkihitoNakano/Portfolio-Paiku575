function shareBtnToTwitter(text, url, tags) {
  const baseUrl = 'https://twitter.com/intent/tweet?'
  const tweetText = ['text', text]
  const hashTags = ['hashtags', [...tags].join(',')]
  const pageUrl = ['url', url]
  const query = new URLSearchParams([tweetText, hashTags, pageUrl]).toString()

  return `${baseUrl}${query}`
}

export { shareBtnToTwitter }
