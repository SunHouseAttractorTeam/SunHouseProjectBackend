const express = require('express')

const router = express.Router()
const dayjs = require('dayjs')

const Module = require('../models/Module')
const Course = require('../models/Course')

const auth = require('../middleweare/auth')
const permit = require('../middleweare/permit')

router.get('/', auth, async (req, res) => {
  try {
    const modules = await Module.find()

    return res.send(modules)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params
  try {
    const modules = await Module.findById(id)

    return res.send(modules)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin', 'teacher'), async (req, res) => {
  try {
    const { title } = req.body
    const { course } = req.query

    if (!title || !course) {
      return res.status(400).send({ error: 'Data not valid' })
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

router.put('/:id', auth, permit('admin', 'teacher'), async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { course } = req.query
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
