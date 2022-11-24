const express = require('express')
const auth = require('../middleweare/auth')
const Lesson = require('../models/Lesson')
const Module = require('../models/Module')
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

router.post('/', auth, permit('admin', 'teacher'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const { title, description } = req.body
    const module = await Module.findById(moduleId)

    if (!module) {
      return res.status(404).send('There are no such module!')
    }

    if (!title && !description) {
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
      id: lessonData._id,
      type: lessonData.type,
      title: lessonData.title,
    })

    await module.save()
    return res.send(lesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
  const moduleId = req.query.module
  try {
    const { title, description } = req.body

    if (!title && !description) {
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

    // TODO: need to wait SUN-70 task for use model Module
    // Need to update lesson model in the Module.data array

    return res.send(updateLesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    const deleteLesson = await Lesson.findByIdAndDelete({ _id: req.params.id })

    // TODO: need to wait SUN-70 task for use model Module
    // Need to delete lesson model from Module.data array

    return res.send(deleteLesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
