const mongoose = require('mongoose')

const { Schema } = mongoose

const TaskSchema = new Schema({
  title: {
    type: String,
    required: { message: 'Введите название' },
    unique: true,
  },
  type: {
    type: String,
    default: 'task',
  },
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  file: String,
  data: [],
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task
