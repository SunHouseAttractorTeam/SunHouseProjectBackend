const mongoose = require('mongoose')

const { Schema } = mongoose

const AnswerSchema = new Schema({
  title: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
})

const QuestionSchema = new Schema({
  title: {
    type: String,
  },
  answers: [AnswerSchema],
})

const TestSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
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
  count: {
    type: Number,
    min: 0,
    default: 3,
  },
  random: {
    type: Boolean,
    default: false,
  },
  correct: {
    type: Number,
    min: 0,
    max: 100,
  },
  questions: [QuestionSchema],
  file: String,
  video: String,
  audio: String,
})

const Test = mongoose.model('Test', TestSchema)
module.exports = Test
