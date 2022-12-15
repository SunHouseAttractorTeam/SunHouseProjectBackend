const express = require('express')
const auth = require('../middleweare/auth')
const Task = require('../models/Task')
const permit = require('../middleweare/permit')
const Module = require('../models/Module')
const Course = require('../models/Course')

const router = express.Router()

router.get('/', auth, async (req, res) => {
  const query = {}

  if (req.query.module) query.module = req.query.module

  try {
    const task = await Task.find(query)
    return res.send(task)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const findTask = await Task.findById(req.params.id)

    if (!findTask) {
      return res.status(404).send({ message: 'Task not found!' })
    }

    return res.send(findTask)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin', 'user'), async (req, res) => {
  const moduleId = req.query.module

  try {
    const { title, description } = req.body
    const module = await Module.findById(moduleId)

    if (!module) return res.status(401).send({ message: 'Module not found' })

    if (!title || !description) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const taskData = {
      title,
      description,
      module: moduleId,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          taskData.file = req.file.file
          break
        case 'video':
          taskData.video = req.file.file
          break
        case 'audio':
          taskData.audio = req.file.file
          break
        default:
          return taskData
      }
    }

    const task = new Task(taskData)
    await task.save()

    module.data.push({
      id: task._id,
      type: task.type,
      title: task.title,
    })

    await module.save()
    return res.send(task)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const course = await Course.findById(req.query.course)
    const { title, description } = req.body

    if (!course) return res.status(404).send({ message: 'There are no such course!' })

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(401).send({ message: 'Authorization error' })
    }

    if (!title || !description) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const taskData = {
      title,
      description,
    }

    if (req.file) {
      switch (req.file.type) {
        case 'file':
          taskData.file = req.file.file
          break
        case 'video':
          taskData.video = req.file.file
          break
        case 'audio':
          taskData.audio = req.file.file
          break
        default:
          return taskData
      }
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).send({ message: 'Task not found!' })
    }

    const updateTask = await Task.findByIdAndUpdate(req.params.id, taskData, { new: true })

    if (task.title !== updateTask.title) {
      const module = await Module.findOne({ _id: req.query.module })

      if (!module) return res.status(401).send({ message: 'Module not found' })

      const itemToData = {
        id: updateTask._id,
        type: updateTask.type,
        title: updateTask.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateTask._id.toString() === item.id.toString()) return itemToData
          return item
        }),
      )
      await module.save()
    }

    return res.send(updateTask)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin', 'user'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    const course = await Course.findById(req.query.course)

    if (!course.teachers.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(401).send('Authoeization error')
    }
    if (!module) return res.status(404).send({ message: 'Module not found' })

    if (!task) {
      return res.status(404).send({ message: 'Task not found!' })
    }

    const response = await Task.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const module = await Module.findById(req.query.module)

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item.id !== task._id)
      await module.save()

      return res.send({ message: 'Success' })
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
