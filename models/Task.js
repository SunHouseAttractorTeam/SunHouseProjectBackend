const mongoose = require('mongoose')

const { Schema } = mongoose

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  file: String,
  video: String,
  audio: String,
})

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task
