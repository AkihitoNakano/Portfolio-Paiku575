import { avatarSize } from '../../config/application.config.js'
import { showBarLoader } from '../../utils/loader.js'
import { disableBtn } from '../../utils/button.js'

const updateAvatarInput = document.getElementById('upload-avatar')
const sendUpdateProfileBtn = document.getElementById('update-profile-btn')

// アバターを更新した際読み込んだ画像を表示する
updateAvatarInput.addEventListener('change', updateAvatar)

// 変更したプロフィールをを送信する
sendUpdateProfileBtn.addEventListener('click', sendUpdateProfile)

// 読み込んだ画像を表示する
function updateAvatar(e) {
  const file = e.target.files[0]
  let fileName = file.name

  const alertText = document.querySelector('.md-update-alert')

  // 拡張子チェック
  if (!file || !fileName.match(/\.(jpg|jpeg|png)$/)) return window.alert('.jpg/.jpeg/.pngのみをサポートしています。')
  if (file.size >= 1024 * 1024 * avatarSize) {
    alertText.style.display = 'flex'
    alertText.innerText = `ファイルサイズは${avatarSize}MB以内に収めてください`
    return
  } else {
    alertText.style.display = 'none'
  }

  const reader = new FileReader()
  reader.onload = e => {
    document.querySelector('.md-prof').src = e.target.result
  }
  reader.readAsDataURL(file)
}

// プロファイル情報を送信する
async function sendUpdateProfile(e) {
  e.preventDefault()
  const updateBtn = document.getElementById('update-profile-btn')
  disableBtn(updateBtn)

  const barLoader = document.querySelector('.bar-loader')
  showBarLoader(barLoader, true)

  const formData = createProfileData()
  const options = {
    method: 'PATCH',
    body: formData,
  }

  const res = await fetch('/user/upload-profile', options)

  if (res.status !== 200) {
    showBarLoader(barLoader, false)
    window.alert('プロフィールをアップデートできませんでした。')
  }
  location.reload()
}

// 送信するまえにプロファイルを設定する
function createProfileData() {
  const formData = new FormData()

  let avatar = updateAvatarInput.files[0]
  let displayName = document.getElementById('update-name-input').value
  let place = document.getElementById('update-place-input').value
  let selfIntroduction = document.getElementById('self-intro-input').value

  if (avatar) {
    formData.append('avatar', avatar)
  }

  formData.append('displayName', displayName)
  formData.append('place', place)
  formData.append('selfIntroduction', selfIntroduction)

  return formData
}

export { updateAvatar, sendUpdateProfile }
