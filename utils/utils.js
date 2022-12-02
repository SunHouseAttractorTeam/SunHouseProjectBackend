const User = require('../models/User')

const updateStatus = async (userId, arrayName, fieldName, fieldId, user) => async (req, res) => {
  await User.update(
    {
      _id: userId,
      [`${arrayName}.${fieldName}`]: fieldId,
    },
    { $set: { [`${arrayName}.$.status`]: false } },
  )
  return res.send(user)
}

module.exports = updateStatus
