const mongoose = require('mongoose')

const { Schema } = mongoose

const RatingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  value: {
    type: Number,
    min: 0,
    max: 5,
  },
})

const CourseSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: [RatingSchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
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
  publish: {
    type: Boolean,
    default: false,
  },
  image: String,
})

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course
