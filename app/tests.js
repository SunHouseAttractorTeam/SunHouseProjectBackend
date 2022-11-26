const express = require('express')

const Test = require('../models/Test')
const Module = require('../models/Module')
const Course = require('../models/Course')
const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const query = {}

  if (req.query.module) query.module = req.query.module

  try {
    const tests = await Test.find(query)

    return res.send(tests)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Test no found' })

    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', permit('teacher', 'admin'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const module = await Module.findOne({ _id: moduleId })

    if (!module) {
      return res.status(404).send({ message: 'There are no such module!' })
    }

    const { title, description, questions } = req.body

    if (!title || !description || !questions) {
      return res.status(401).send({ message: 'Data not valid' })
    }

    const testData = {
      title,
      description,
      questions,
      file: null,
      video: null,
      audio: null,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          testData.file = req.file.file
          break
        case 'video':
          testData.video = req.file.file
          break
        case 'audio':
          testData.audio = req.file.file
          break
        default:
          return testData
      }
    }

    const test = new Test(testData)
    await test.save()

    module.data.push({
      id: test._id,
      type: test.type,
      title: test.title,
    })

    await module.save()
    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.put('/:id', auth, permit('teacher', 'admin'), async (req, res) => {
  try {
    const moduleId = req.query.module
    const courseId = req.query.courses

    const course = await Course.findById(courseId)
    const { title, description, questions } = req.body

    if (!course) return res.status(404).send({ message: 'There are no such course' })

    if (!course.owners.includes(req.user._id.toString()) || req.user.role !== 'admin') {
      return res.status(404).send({ message: 'Authorization error!' })
    }

    if (!title || !description || !questions) {
      return res.status(401).send({ message: 'Data not valid' })
    }

    const testData = {
      title,
      description,
      questions,
      file: null,
      video: null,
      audio: null,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          testData.file = req.file.file
          break
        case 'video':
          testData.video = req.file.file
          break
        case 'audio':
          testData.audio = req.file.file
          break
        default:
          return testData
      }
    }

    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send({ message: 'Test not found' })

    const updateTest = await Test.findByIdAndUpdate(req.params.id, testData)
    await updateTest.save()

    if (test.title !== updateTest.title) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      const itemToData = {
        id: updateTest._id,
        type: updateTest.type,
        title: updateTest.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateTest._id.toString() === item.id.toString()) return itemToData
          return item
        }),
      )

      await module.save()
    }

    return res.send(updateTest)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, permit('teacher', 'admin'), async (req, res) => {
  try {
    const moduleId = req.query.module
    const courseId = req.query.course
    const test = await Test.findById(req.params.id)
    const course = await Course.findById(courseId)

    if (!course) return res.status(404).send({ message: 'Course not found!' })

    if (!course.owners.includes(req.user._id.toString()) || req.user.role !== 'admin') {
      return res.status(404).send({ message: 'Authorization error!' })
    }

    if (!test) {
      return res.status(404).send({ message: 'Test not found' })
    }

    const response = await Test.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const module = await Module.findOne({ _id: moduleId })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item.id !== test._id)
      await module.save()

      return res.send('Success')
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router
