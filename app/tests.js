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

    if (!test) return res.status(404).send('Test no found')

    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.post('/', permit('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, questions } = req.body

    if (!title || !description || !module || !questions) {
      return res.status(401).send('Data not valid')
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

    Module.data.push({
      id: test._id,
      type: test.type,
      title: test.title,
    })
    await Module.save()

    return res.send(test)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.put('/:id', auth, permit('teacher', 'admin'), async (req, res) => {
  const { title, description, questions, module } = req.body

  if (!title || !description || !module || !questions) {
    return res.status(401).send('Data not valid')
  }

  const testData = {
    title,
    description,
    module,
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

  try {
    const test = await Test.findById(req.params.id)

    if (!test) return res.status(404).send('Test not found')

    if (!Course.owners.includes(req.user._id.toString()) || req.user.role !== 'admin') {
      return res.status(404).send('Authorization error!')
    }

    const updateTest = await Test.findByIdAndUpdate(req.params.id, testData)
    await updateTest.save()

    if (test.title !== updateTest.title) {
      const itemToData = {
        id: updateTest._id,
        type: updateTest.type,
        title: updateTest.title,
      }

      const data = await Promise.all(
        Module.data.map(item => {
          if (updateTest._id.toString() === item.id.toString()) return itemToData
          return item
        }),
      )

      Module.data = data
      await Module.save()
    }

    return res.send(updateTest)
  } catch (e) {
    return res.sendStatus(500)
  }
})

router.delete('/:id', auth, permit('teacher', 'admin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)

    if (!Course.owners.includes(req.user._id.toString()) || req.user.role !== 'admin') {
      return res.status(404).send('Authorization error!')
    }

    if (!test) {
      return res.status(404).send('Test not found')
    }

    const response = await Test.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const newData = Module.data.filter(item => item.id !== test._id)

      Module.data = newData
      await Module.save()

      return res.send('Success')
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.sendStatus(500)
  }
})

module.exports = router