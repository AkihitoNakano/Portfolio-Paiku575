import { disableBtn, enableBtn } from '../../utils/button.js'
import { createAlert } from '../../settings.js'

async function deleteAccount() {
  disableBtn(this)
  const res = await fetch('/user/me', { method: 'DELETE' })
  if (res.status === 500) {
    enableBtn(this)
    const alertEl = document.querySelector('.del-acc-alert')
    return createAlert(
      'サーバーエラー、アカウントを削除できませんでした。',
      alertEl
    )
  }

  location = '/'
}

export { deleteAccount }
