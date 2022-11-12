async function logout() {
  try {
    await fetch('/user/logout', { method: 'POST' })
    location.assign('/index')
  } catch (e) {
    console.log(e, 'logoutできませんでした')
    window.alert('ログアウトできませんでした')
  }
}

async function logoutAll() {
  try {
    await fetch('/user/logoutAll', { method: 'POST' })
    location.assign('/index')
  } catch (e) {
    console.log(e, 'logoutできませんでした')
    window.alert('ログアウトできませんでした')
  }
}

export { logout, logoutAll }
