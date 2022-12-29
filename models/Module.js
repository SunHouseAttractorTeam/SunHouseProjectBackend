const mongoose = require('mongoose')
const Task = require('./Task')
const Lesson = require('./Lesson')
const Test = require('./Test')

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

  await Task.deleteMany({ module: moduleId })
  await Lesson.deleteMany({ module: moduleId })
  await Test.deleteMany({ module: moduleId })

  next()
})

const Module = mongoose.model('Module', ModuleSchema)

module.exports = Module
