const Course = require('../models/Course')

const serchAccesser = async (req, res, next) => {
  const course = await Course.findById(req.query.course)

  if (!course.owners.includes(req.user._id)) {
    return res.status(403).send({ message: "User don't have permission" })
  }

  next()
}

module.exports = serchAccesser
