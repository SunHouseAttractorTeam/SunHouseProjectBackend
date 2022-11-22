const express = require('express')

const Course = require('../models/Course')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')
const dayjs = require("dayjs");

const router = express.Router()

router.get('/', async (req, res) => {
  const query = {}

  if (req.query.category) query.category = req.query.category

  try {
    let courses
    if (req.query.user) {
      courses = await Course.find({ user: req.query.user }).sort().populate('category', 'title').populate('user')
    } else {
      courses = await Course.find(query).sort().populate('category', 'title').populate('user')
    }

    return res.send(courses)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      res.status(404).send({ message: 'Course not found!' })
    }

    return res.send(course)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', auth, permit('teacher'), async (req, res) => {
  try {
    const { title, description, category, price} = req.body

    if (!title || !description || !category || !price) {
      return res.status(401).send({ message: 'Data not valid!' })
    }

    const courseData = {
      title,
      description,
      user: req.user._id,
      category,
      price,
      dateTime: dayjs().format('DD/MM/YYYY'),
    }

    const course = new Course(courseData)
    await course.save()

    return res.send(course)
  } catch (e) {
    return res.status(400).send(e)
  }
})

router.put('/:id', auth, permit('teacher'), async (req, res) => {
  const { title, description, category, price} = req.body

  if (!title || !description || !category || !price) {
    return res.status(401).send({ message: 'Data not valid!' })
  }

  const courseData = {
    title,
    description,
    category,
    user: req.user._id,
    price,
    dateTime: dayjs().format('DD/MM/YYYY'),
  }

  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).send({ message: 'Course not found!' })
    }

    if (course.user._id !== user._id) {
      return res.status(401).send({ message: 'Wrong token!' })
    }

    const updateCourse = await Course.findOneAndUpdate(req.params.id, courseData)

    return res.send(updateCourse)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
  const courseId = req.params.id

  try {
    const course = await Course.findById(courseId)

    if (course.user._id === req.user._id || req.user.role === 'admin') {
      const response = await Course.deleteOne({ _id: courseId })

      if (response.deletedCount) {
        return res.send('Success')
      }
      return res.status(403).send({ error: 'Deleted failed' })
    }

    return res.status(401).send({ message: 'Wrong token!' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router
