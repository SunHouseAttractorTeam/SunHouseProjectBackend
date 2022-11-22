const mongoose = require('mongoose')

const { Schema } = mongoose


const RatingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  value: {
    type: Number,
    min: 0,
    max: 5,
  },
})

const UsersSchema = new Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      status: true,
})


const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  rating: [RatingSchema],
  users: [UsersSchema],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  dateTime: {
    type: String,
    required: true,
  },
  image: String
})

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course
