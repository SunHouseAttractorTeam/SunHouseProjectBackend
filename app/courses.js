const express = require('express')

const dayjs = require('dayjs')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const auth = require('../middleweare/auth')
const upload = require('../middleweare/upload')
const User = require('../models/User')
const permit = require('../middleweare/permit')
const searchAccesser = require('../middleweare/searchAccesser')

const router = express.Router()

router.get('/', async (req, res) => {
  const query = {}
  if (req.query.category) query.category = req.query.category
  try {
    const courses = await Course.find(query).sort({ dateTime: 1 }).populate({
      path: 'category',
      select: 'title',
    })
    return res.send(courses)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules')

    if (!course) {
      return res.status(404).send({ message: 'Такого курса нет!' })
    }

    return res.send(course)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, price } = req.body

    if (!title || !category) {
      return res.status(401).send({ message: 'Введенные данные не верны!' })
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
    course.teachers.push(req.user._id)

    await course.save()

    return res.send(course)
  } catch (e) {
    return res.status(400).send(e)
  }
})

// Добавление студетов и владельцев

router.put('/add', auth, async (req, res) => {
  let user = null
  const userId = req.query.user
  const ownerId = req.query.owner
  const courseID = req.query.course

  try {
    if (userId) {
      user = await User.findById(userId)
    }
    if (ownerId) {
      user = await User.findById(ownerId)
    }
    if (!user) {
      return res.status(404).send({ message: 'Такого пользователя нет!' })
    }
    const course = await Course.findById(courseID)
    if (!course) {
      return res.status(404).send({ message: 'Такого курса нет!' })
    }
    if (userId) {
      if (!course.users.includes(userId)) {
        const addUsers = await Course.findByIdAndUpdate(courseID, { $push: { users: user } })
        return res.send(addUsers)
      }
    }
    if (ownerId) {
      if (!course.teachers.includes(ownerId)) {
        const addOwners = await Course.findByIdAndUpdate(courseID, { $push: { owners: user } })
        return res.send(addOwners)
      }
    }
    return res.send(course)
  } catch (e) {
    return res.sendStatus(500)
  }
})

//  Изменение статуса публикации курса

router.post('/:id/publish', auth, permit('admin'), async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      return res.status(404).send({ message: 'Такого курса нет!' })
    }
    const course = await Course.findById(id)
    if (!course) {
      return res.status(404).send({ message: 'Такого курса нет!' })
    }
    course.publish = !course.publish
    await course.save()
    res.send(course)
  } catch (e) {
    res.status(400).send({ error: e.errors })
  }
})

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  const { title, description, category, private, image } = req.body
  if (!title || !category) {
    return res.status(401).send({ message: 'Введенные данные не верны!' })
  }
  const courseData = {
    title,
    description,
    category,
    private,
    image: image !== '' ? image : null,
  }

  if (req.file) {
    courseData.image = `uploads/${req.file.filename}`
  }

  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).send({ message: 'Такого курса нет!' })
    }
    const updateCourse = await Course.findByIdAndUpdate(req.params.id, courseData)
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

    return res.send(updatedRating[0])
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.patch('/edit_image', auth, searchAccesser, upload.single('headerImage'), async (req, res) => {
  try {
    const id = req.query.course

    let image
    if (req.file !== undefined) {
      image = req.file.filename
    }

    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).send({ message: 'Курс не найден!' })
    }

    await Course.findByIdAndUpdate(id, { headerImage: image })

    return res.send({ message: 'Картинка успешно сменен!' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, async (req, res) => {
  const courseId = req.params.id
  try {
    const course = await Course.findById(courseId)
    if (course.user._id.toString() === req.user._id.toString()) {
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
