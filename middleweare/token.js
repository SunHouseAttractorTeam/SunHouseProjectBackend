const jwt = require('jsonwebtoken')

module.exports.getToken = (displayName, expirationTime) => {
  const token = jwt.sign({ displayName }, process.env.TOKEN_KEY, {
    expiresIn: expirationTime,
  })

  return token
}
