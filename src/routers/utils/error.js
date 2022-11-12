// handle errors
const handleErrors = err => {
  let errors = []
  // duplicate email error code
  if (err.code === 11000) {
    const error = {}
    const keyName = Object.keys(err.keyValue)[0]
    error[keyName] = `${keyName}はすでに使用されています`
    errors.push(error)
    return errors
  }
  // validation errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      const error = {}
      error[properties.path] = properties.message
      errors.push(error)
    })
    return errors
  }

  if (err) {
    const error = {}
    error[err.message.split(',')[0]] = err.message.split(',')[1]

    errors.push(error)
    return errors
  }
}

// Check input from singUp
const checkInputForm = (input, target, min, max) => {
  const re = /^[a-zA-Z0-9!-/:-@¥[-`{-~]*$/
  if (!re.test(input.trim())) {
    throw new Error([target, `半角英数字で入力してください`])
  }
  if (input.length < min || input.length > max) {
    throw new Error([target, `半角英数字${min}以上、${max}以内にしてください`])
  }
  return
}

module.exports = { handleErrors, checkInputForm }
