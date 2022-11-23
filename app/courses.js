const express = require('express')

const dayjs = require('dayjs')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')
const User = require('../models/User')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const course = await Course.find().sort({ dateTime: 1 })
    return res.send(course)
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
    const { title, description, category, price, image } = req.body

    if (!title || !description || !category || !price) {
      return res.status(401).send({ message: 'Data not valid!' })
    }
    const courseData = {
      title,
      description,
      user: req.user._id,
      category,
      price,
      image,
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
  const { title, description, category, price, image } = req.body
  if (!title || !description || !category || !price) {
    return res.status(401).send({ message: 'Data not valid!' })
  }
  const courseData = {
    title,
    description,
    category,
    user: req.user._id,
    price,
    image,
    dateTime: dayjs().format('DD/MM/YYYY'),
  }
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).send({ message: 'Course not found!' })
    }
    if (course.user._id !== req.user._id) {
      return res.status(401).send({ message: 'Wrong token!' })
    }
    const updateCourse = await Course.findOneAndUpdate(req.params.id, courseData)
    return res.send(updateCourse)
  } catch (e) {
    return res.sendStatus(500)
  }
})

// Добавление рейтинга

router.put('/', auth, async (req, res) => {
  try {
    const { id, rating } = req.body
    if (!rating) {
      return res.status(400).send('Data not valid')
    }

    const course = await Course.find({ _id: id, rating: { $elemMatch: { user: req.user._id } } })

    if (course.length === 0) {
      const newRating = { rating, user: req.user._id }
      await Course.updateOne({ _id: id }, { $push: { rating: newRating } })
    } else {
      await Course.updateOne({ _id: id, 'rating.user': req.user._id }, { $set: { 'rating.$.rating': rating } })
    }

    const updatedRating = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $addFields: { ratingAverage: { $avg: '$rating.rating' } } },
    ])

    res.send(updatedRating[0])
  } catch (e) {
    res.sendStatus(500)
  }
})

// Добавление владельцев

router.put('/add_owners', auth, permit('teacher'), async (req, res) => {
  const userId = req.query.user
  const courseID = req.query.course
  try {
    if (userId || courseID) {
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).send({ message: 'User not found!' })
      }
      await User.findByIdAndUpdate(userId, { role: 'teacher' })
      const course = await Course.findById(courseID)
      if (!course) {
        return res.status(404).send({ message: 'Course not found!' })
      }
      if (!course.owners.includes(userId)) {
        const addOwners = await Course.findByIdAndUpdate(courseID, { $push: { owners: userId } })
        return res.send(addOwners)
      }
      return res.send(course)
    }
  } catch (e) {
    return res.sendStatus(500)
  }
})

// Добавление студентов на курс

router.put('/add_users', auth, permit('teacher'), async (req, res) => {
  const userId = req.query.user
  const courseID = req.query.course
  try {
    if (userId || courseID) {
      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).send({ message: 'User not found!' })
      }
      const course = await Course.findById(courseID)
      if (!course) {
        return res.status(404).send({ message: 'Course not found!' })
      }
      if (!course.users.includes(userId)) {
        const addUsers = await Course.findByIdAndUpdate(courseID, { $push: { users: userId, status: true } })
        return res.send(addUsers)
      }
      return res.send(course)
    }
  } catch (e) {
    return res.sendStatus(500)
  }
})

// Изменение статуса

router.put('/:id/status', auth, permit('admin'), async (req, res) => {
  const authUser = req.user._id.toString()
  const id = req.params._id

  try {
    const user = await User.findById(authUser)
    if (!user) {
      return res.status(404).send({ message: 'User not found!' })
    }
    const course = await Course.findOne(id)
    if (!course) {
      return res.status(404).send({ message: 'Course not found' })
    }
    if (course.users.includes(authUser)) {
      const updatedStatus = await Course.findByIdAndUpdate(id, { $push: { users: { status: false } } })
      return res.send(updatedStatus)
    }
    return res.send(course)
  } catch (e) {
    res.sendStatus(500)
  }
})

// Удаление курса

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
