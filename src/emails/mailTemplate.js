function validEmailEl(email, name) {
  const contentEl = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email validation</title>
  
    <style>
  
      .container {
        background-color: #fff;
        border-radius: 10px;
        width: 600px;
        padding: 30px 30px;
        margin: 100px auto 20px auto;
  
      }
  
      button {
        cursor:pointer;
        color:#fff;
        background-color: #4bbaa2;
        font-size: 0.8rem;
        text-align: center;
        border:none;
        border-radius: 5px;
        padding: 10px 15px;
        margin: 20px 0;
      }
  
      .footer {
        text-align: center;
      }
      .footer p {
        color: gray;
        font-size: 0.5rem;
      }
  
    </style>
  
  </head>
  <body>
    <div class="container">
      <h1>メールアドレスの確認</h1>
      <p><strong>${name}さん</strong></p>
      <p>登録ありがとうございます！そして、下記ボタンをクリックしてメールが有効であることを確認してね！</p>
      <p>もしこのメールに心当たりがない場合は、削除してもらえると嬉しいな！</p>
      <div class="key-valid">
      </div>

      <a href="https://paiku575.com/user/settings/authentication/${email}"><button>メールアドレスを有効にする</button></a>
      <p>もし上記のボタンが動作しない場合は以下のリンクをブラウザに貼り付けて下さい。</p>
      <a href="https://paiku575.com/user/settings/authentication/${email}">https://paiku575.com/user/settings/authentication/${email}</a>
  
      <p>あともうちょっと!<br> paiku575運営</p>
      <p></p>
    </div>
    <div class="footer">
      <p>paiku575.com</p>
    </div>
  </body>
  </html>
`

  return contentEl
}

function resetPasswordEl(email) {
  const contentEl = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email validation</title>
  
    <style>
  
      .container {
        background-color: #fff;
        border-radius: 10px;
        width: 600px;
        padding: 30px 30px;
        margin: 100px auto 20px auto;
  
      }
  
      button {
        cursor:pointer;
        color:#fff;
        background-color: #4bbaa2;
        font-size: 0.8rem;
        text-align: center;
        border:none;
        border-radius: 5px;
        padding: 10px 15px;
        margin: 20px 0;
      }
  
      .footer {
        text-align: center;
      }
      .footer p {
        color: gray;
        font-size: 0.5rem;
      }
  
    </style>
  
  </head>
  <body>
    <div class="container">
      <h1>パスワード再設定のお願い</h1>
      <p>パスワードを再設定するにリンクから設定の手続きをお願いします。</p>
      <p>もしこのメールに心当たりがない場合は、削除してもらえると嬉しいな！</p>
      <div class="key-valid">
      </div>

      <a href="https://paiku575.com/user/settings/auth-key/${email}"><button>パスワードの設定を行う</button></a>
      <p>もし上記のボタンが動作しない場合は以下のリンクをブラウザに貼り付けて下さい。</p>
      <a href="https://paiku575.com/user/settings/auth-key/${email}">https://paiku575.com/user/settings/auth-key/${email}</a>
  
      <p>あともうちょっと!<br> paiku575運営</p>
      <p></p>
    </div>
    <div class="footer">
      <p>paiku575.com</p>
    </div>
  </body>
  </html>
`

  return contentEl
}

module.exports = { validEmailEl, resetPasswordEl }
