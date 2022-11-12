function keyGenerator() {
  let generatedPassword = ''
  for (let i = 0; i < 6; i++) {
    generatedPassword += getRandomNumber()
  }
  return generatedPassword
}

function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48)
}

module.exports = { keyGenerator }
