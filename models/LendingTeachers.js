const mongoose = require('mongoose')

const { Schema } = mongoose

const TeachersSchema = new Schema({
  name: {
    type: String,
    required: { message: 'Введите имя' },
  },
  description: {
    type: String,
    required: { message: 'Введите описание' },
  },
  image: String,
})

const LendingTeachers = mongoose.model('LendingTeachers', TeachersSchema)

module.exports = LendingTeachers
