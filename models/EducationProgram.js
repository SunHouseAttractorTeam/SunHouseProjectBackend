const mongoose = require('mongoose')

const { Schema } = mongoose

const EducationProgramSchema = new Schema({
  title: {
    type: String,
    required: { message: 'Введите название' },
  },
  description: {
    type: String,
  },
  video: {
    type: String,
  },
  tests: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  },
})

const EducationProgram = mongoose.model('EducationProgram', EducationProgramSchema)

module.exports = EducationProgram
