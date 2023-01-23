const mongoose = require('mongoose')
const Task = require('./Task')
const Lesson = require('./Lesson')
const Test = require('./Test')
const { deleteFile } = require('../middleweare/clearArrayFromFiles')

const { Schema } = mongoose

const ModuleSchema = new Schema({
  title: {
    type: String,
    required: { message: 'Введите название' },
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  data: [],
  visibility: {
    type: Boolean,
    default: true,
  },
})

ModuleSchema.pre('deleteOne', async function (next) {
  const moduleId = this._conditions._id

  const tasksId = await Task.distinct('_id', { module: moduleId })
  const testsId = await Test.distinct('_id', { module: moduleId })
  const lessonsId = await Lesson.distinct('_id', { module: moduleId })

  if (tasksId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of tasksId) {
      // eslint-disable-next-line no-await-in-loop
      const task = await Task.findById(id)

      if (task.file) deleteFile(task.file)

      if (task.data && task.data.length !== 0) {
        task.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  if (testsId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of testsId) {
      // eslint-disable-next-line no-await-in-loop
      const test = await Test.findById(id)

      if (test.file) deleteFile(test.file)

      if (test.data && test.data.length !== 0) {
        test.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  if (lessonsId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of lessonsId) {
      // eslint-disable-next-line no-await-in-loop
      const lesson = await Lesson.findById(id)

      if (lesson.file) deleteFile(lesson.file)

      if (lesson.data && lesson.data.length !== 0) {
        lesson.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  await Task.deleteMany({ module: moduleId })
  await Lesson.deleteMany({ module: moduleId })
  await Test.deleteMany({ module: moduleId })

  next()
})

const Module = mongoose.model('Module', ModuleSchema)

module.exports = Module
