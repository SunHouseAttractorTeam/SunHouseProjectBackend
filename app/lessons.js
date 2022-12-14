const express = require('express')
const auth = require('../middleweare/auth')
const Lesson = require('../models/Lesson')
const Module = require('../models/Module')
const Course = require('../models/Course')
const permit = require('../middleweare/permit')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const query = {}

  if (req.query.module) query.module = req.query.module

  try {
    const lesson = await Lesson.find(query)
    return res.send(lesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const findLesson = await Lesson.findById(req.params.id)

    if (!findLesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    return res.send(findLesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin', 'user'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const { title, description } = req.body
    const module = await Module.findById(moduleId)

    if (!module) {
      return res.status(404).send({ message: 'There are no such module!' })
    }

    if (!title) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const lessonData = {
      title,
      description,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          lessonData.file = req.file.file
          break
        case 'video':
          lessonData.video = req.file.file
          break
        case 'audio':
          lessonData.audio = req.file.file
          break
        default:
          return lessonData
      }
    }

    const lesson = new Lesson(lessonData)
    await lesson.save()

    module.data.push({
      id: lesson._id,
      type: lesson.type,
      title: lesson.title,
    })

    await module.save()
    return res.send(lesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, permit('admin', 'user'), async (req, res) => {
  const moduleId = req.query.module
  const courseId = req.query.course

  try {
    const { title, description } = req.body
    const course = await Course.findById(courseId)

    if (!course) return res.status(404).send({ message: 'There are no such course' })

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(401).send({ message: 'Authorization error' })
    }

    if (!title) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const lessonData = {
      title,
      description,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          lessonData.file = req.file.file
          break
        case 'video':
          lessonData.video = req.file.file
          break
        case 'audio':
          lessonData.audio = req.file.file
          break
        default:
          return lessonData
      }
    }

    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    const updateLesson = await Lesson.findByIdAndUpdate(req.params.id, lessonData, { new: true })

    if (lesson.title !== updateLesson.title) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      const itemToData = {
        id: updateLesson._id,
        type: updateLesson.type,
        title: updateLesson.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateLesson._id.toString() === item.id.toString()) return itemToData
          return item
        }),
      )
      await module.save()
    }

    return res.send(updateLesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const moduleId = req.query.module
    const courseId = req.query.course
    const lesson = await Lesson.findById(req.params.id)
    const course = await Course.findOne({ _id: courseId })

    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    if (!course) return res.status(404).send({ message: 'Course not found!' })

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(401).send({ message: 'Authorization error' })
    }

    const response = await Lesson.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item.id !== lesson._id)
      await module.save()

      return res.send('Success')
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
