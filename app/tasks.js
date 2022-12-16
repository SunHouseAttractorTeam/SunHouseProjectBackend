const express = require('express')
const auth = require('../middleweare/auth')
const Task = require('../models/Task')
const Module = require('../models/Module')
const upload = require('../middleweare/upload')
const searchAccesser = require('../middleweare/searchAccesser')

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

router.post('/', auth, searchAccesser, async (req, res) => {
  const moduleId = req.query.module

  try {
    const { title } = req.body
    const module = await Module.findById(moduleId)

    if (!module) return res.status(401).send({ message: 'Module not found' })

    if (!title) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const taskData = {
      title,
      module: moduleId,
    }

    const task = new Task(taskData)
    await task.save()

    module.data.push({
      _id: task._id,
      type: task.type,
      title: task.title,
    })

    await module.save()
    return res.send(task)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, upload.any(), searchAccesser, async (req, res) => {
  try {
    const files = [...req.files]

    const parsedData = [...JSON.parse(req.body.payload)]
    const data = parsedData.map(item => {
      const keyName = Object.keys(item)[0]
      if (files.length) {
        if (keyName === files[0].fieldname) {
          item[keyName] = files[0].filename
          files.splice(0, 1)
        }
      }

      return item
    })

    const index = data.length - 1
    const lastFile = data[index]

    let isFile
    if (Object.keys(lastFile)[0] === 'file') {
      const { file } = data.splice(index, 1)[0]
      isFile = file
    }
    const { title } = data.splice(0, 1)[0]

    if (!title) {
      return res.status(400).send({
        message: 'Data not valid',
      })
    }

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).send({ message: 'Task not found!' })
    }

    const updateTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        data,
        file: isFile,
      },
      { new: true },
    )

    if (task.title !== updateTask.title) {
      const module = await Module.findOne({ _id: req.query.module })

      if (!module) return res.status(401).send({ message: 'Module not found' })

      const itemToData = {
        _id: updateTask._id,
        type: updateTask.type,
        title: updateTask.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateTask._id.toString() === item._id.toString()) return itemToData
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

router.delete('/:id', auth, searchAccesser, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).send({ message: 'Task not found!' })
    }

    const response = await Task.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      const module = await Module.findById(req.query.module)

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item._id !== task._id)
      await module.save()

      return res.send({ message: 'Success' })
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
