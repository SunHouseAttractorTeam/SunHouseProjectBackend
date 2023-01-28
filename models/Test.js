const mongoose = require('mongoose')

const { Schema } = mongoose

const QuestionSchema = new Schema({
  title: {
    type: String,
  },
  answers: [{ title: String, status: { type: Boolean, default: false } }],
})

const TestSchema = new Schema({
  title: {
    type: String,
    required: { message: 'Введите название' },
  },
  type: {
    type: String,
    default: 'test',
  },
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  random: {
    type: Boolean,
    default: false,
  },
  correct: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  questions: [QuestionSchema],
  file: String,
  data: [],
})

const Test = mongoose.model('Test', TestSchema)
module.exports = Test
