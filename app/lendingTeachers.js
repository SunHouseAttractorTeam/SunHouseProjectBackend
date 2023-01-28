const express = require('express')
const upload = require('../middleweare/upload')
const permit = require('../middleweare/permit')
const auth = require('../middleweare/auth')
const Teachers = require('../models/LendingTeachers')
const { deleteFile } = require('../middleweare/clearArrayFromFiles')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const teachers = await Teachers.find()
    return res.send(teachers)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.post('/', auth, permit('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body
    if (!name || !description) {
      return res.status(400).send({
        message: 'Введенные данные не верны!',
      })
    }
    const teachersData = {
      name,
      description,
      image: null,
    }
    if (req.file) {
      teachersData.image = req.file.filename
    }

    const teachers = new Teachers(teachersData)
    await teachers.save()
    return res.send(teachers)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

router.delete('/:id', auth, permit('admin'), async (req, res) => {
  try {
    const teachers = await Teachers.findById(req.params.id)

    if (!teachers) {
      return res.status(404).send({ message: 'Препод не найден!' })
    }

    const deleteTeacher = await Teachers.findByIdAndDelete({ _id: req.params.id })

    if (deleteTeacher.image) {
      deleteFile(deleteTeacher.image)
    }

    return res.send(deleteTeacher)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
})

module.exports = router
