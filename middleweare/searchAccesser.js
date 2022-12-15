const Course = require('../models/Course')
const Module = require('../models/Module')

const searchAccesser = async (req, res, next) => {
  let course
  if (req.query.module) {
    const module = await Module.findById(req.query.module)
    course = await Course.findById(module.course)
  } else {
    course = await Course.findById(req.query.course)
  }

  if (!course) return res.status(400).send({ error: 'Course not found!' })

  if (!course.teachers.includes(req.user._id)) {
    return res.status(403).send({ message: "User don't have permission" })
  }

  next()
}

module.exports = searchAccesser
