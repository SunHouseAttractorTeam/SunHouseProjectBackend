const express = require('express')

const router = express.Router()
const dayjs = require('dayjs')

const Module = require('../models/Module')
const Course = require('../models/Course')

const auth = require('../middleweare/auth')
const searchAccesser = require('../middleweare/searchAccesser')

router.post('/', auth, searchAccesser, async (req, res) => {
  try {
    const { title } = req.body
    const { course } = req.query

    if (!title || !course) {
      return res.status(400).send({ error: 'Введенные данные не верны!' })
    }

    const modulesData = {
      title,
      course,
      datetime: dayjs().format('DD/MM/YYYY'),
    }

    const modules = new Module(modulesData)
    await modules.save()
    await Course.findByIdAndUpdate(course, { $push: { modules: modules._id } })

    return res.send(modules)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, searchAccesser, async (req, res) => {
  try {
    const { id } = req.params
    const { title } = req.body

    const modules = await Module.findById(id)

    if (!modules) {
      return res.status(400).send({ message: 'Module not found' })
    }

    modules.title = title

    modules.save()
    return res.send(modules)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/', auth, searchAccesser, async (req, res) => {
  try {
    const { course, id } = req.query

    const modules = await Module.findById(id)

    if (!modules) {
      return res.status(401).send({ message: 'Not found' })
    }

    await Course.findByIdAndUpdate(course, { $pull: { modules: id } })
    await Module.deleteOne(modules)

    return res.send({ message: 'Success' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
