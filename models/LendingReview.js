const mongoose = require('mongoose')

const { Schema } = mongoose

const ReviewSchema = new Schema({
  name: {
    type: String,
    required: { message: 'Введите имя' },
  },
  description: {
    type: String,
    required: { message: 'Введите описание' },
  },
  socialNetwork: {
    type: String,
    required: true,
  },
  image: String,
})

const LendingReview = mongoose.model('LendingReview', ReviewSchema)

module.exports = LendingReview
