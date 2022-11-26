const mongoose = require('mongoose')

const { Schema } = mongoose

const ReviewsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    required: true,
    type: String,
  },
})

const Reviews = mongoose.model('Reviews', ReviewsSchema)

module.exports = Reviews
