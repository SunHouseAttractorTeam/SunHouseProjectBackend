const mongoose = require('mongoose')

const { Schema } = mongoose

const ReviewSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  socialNetwork: {
    type: String,
    required: true,
  },
  image: String,
})

const LendingReview = mongoose.model('LendingReview', ReviewSchema)

module.exports = LendingReview
