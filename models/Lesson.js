const mongoose = require('mongoose')

const { Schema } = mongoose

const LessonSchema = new Schema({
  title: {
    type: String,
    required: { message: 'Введите название' },
  },
  type: {
    type: String,
    default: 'lesson',
  },
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  file: String,
  data: [],
})

const Lesson = mongoose.model('Lesson', LessonSchema)
module.exports = Lesson
