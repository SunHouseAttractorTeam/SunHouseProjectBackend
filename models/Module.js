const mongoose = require('mongoose')

const { Schema } = mongoose

const ModuleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  data: [],
})

const Module = mongoose.model('Module', ModuleSchema)

module.exports = Module
