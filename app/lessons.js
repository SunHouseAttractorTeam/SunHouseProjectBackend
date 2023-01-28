const express = require('express')
const auth = require('../middleweare/auth')
const Lesson = require('../models/Lesson')
const Module = require('../models/Module')
const User = require('../models/User')
const searchAccesser = require('../middleweare/searchAccesser')
const upload = require('../middleweare/upload')
const { clearArrayFromFiles, deleteFile } = require('../middleweare/clearArrayFromFiles')

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

router.post('/', auth, searchAccesser, async (req, res) => {
  const moduleId = req.query.module
  try {
    const { title } = req.body
    const module = await Module.findById(moduleId).populate('course', 'users')
    if (!module) {
      return res.status(404).send({ message: 'There are no such module!' })
    }

    if (!title) {
      return res.status(400).send({
        message: 'Введите название',
      })
    }

    const lessonData = {
      title,
      module: moduleId,
    }

    const lesson = new Lesson(lessonData)
    await lesson.save()

    module.data.push({
      _id: lesson._id,
      type: lesson.type,
      title: lesson.title,
    })

    // eslint-disable-next-line no-restricted-syntax
    for (const id of module.course.users) {
      // eslint-disable-next-line no-await-in-loop
      await User.findByIdAndUpdate(id, { $push: { lessons: { lesson } } })
    }

    await module.save()
    return res.send(lesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.put('/:id', auth, searchAccesser, upload.any(), async (req, res) => {
  try {
    const files = [...req.files]

    const parsedData = [...JSON.parse(req.body.payload)]
    const data = parsedData.map(item => {
      const keyName = Object.keys(item)[0]
      if (files.length) {
        if (keyName === files[0].fieldname && typeof item[keyName] !== 'string') {
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
        message: 'Введите название',
      })
    }

    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    const updateLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        title,
        data,
        file: isFile,
      },
      { new: true },
    )

    if (lesson.title !== updateLesson.title) {
      const module = await Module.findOne({ _id: lesson.module })

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      const itemToData = {
        _id: updateLesson._id,
        type: updateLesson.type,
        title: updateLesson.title,
      }

      module.data = await Promise.all(
        module.data.map(item => {
          if (updateLesson._id.toString() === item._id.toString()) return itemToData
          return item
        }),
      )
      await module.save()
    }

    if (lesson.file && lesson.file !== updateLesson.file) {
      deleteFile(lesson.file)
    }

    if (lesson.data.length !== 0) {
      clearArrayFromFiles(lesson.data, updateLesson.data)
    }

    return res.send(updateLesson)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, searchAccesser, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)

    if (!lesson) {
      return res.status(404).send({ message: 'Lesson not found!' })
    }

    const response = await Lesson.deleteOne({ _id: req.params.id })

    if (response.deletedCount) {
      if (lesson.file) deleteFile(lesson.file)

      if (lesson.data && lesson.data.length !== 0) {
        lesson.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }

      const module = await Module.findById(lesson.module)

      if (!module) {
        return res.status(404).send({ message: 'There are no such module!' })
      }

      module.data = module.data.filter(item => item._id.toString() !== lesson._id.toString())
      await module.save()

      return res.send({ message: 'Success' })
    }

    return res.status(403).send({ error: 'Deleted failed' })
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
