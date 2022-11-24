const mongoose = require('mongoose')

const { Schema } = mongoose

const LessonSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    default: 'Lesson',
  },
  file: String,
  video: String,
  audio: String,
})

const Lesson = mongoose.model('Lesson', LessonSchema)
module.exports = Lesson
