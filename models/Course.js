const mongoose = require('mongoose')
const Module = require('./Module')
const Task = require('./Task')
const Lesson = require('./Lesson')
const Test = require('./Test')

const { Schema } = mongoose

const WillLearnSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: 'чему вы научитесь',
  },
  visibility: {
    type: Boolean,
    default: true,
  },
  data: [
    {
      title: {
        type: String,
        required: true,
      },
      image: String,
      description: {
        type: String,
        required: true,
      },
    },
  ],
})

const teachersBlockSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: 'преподаватели',
  },
  visibility: {
    type: Boolean,
    default: true,
  },
  data: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

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
  rating: [RatingSchema],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  WillLearn: WillLearnSchema,
  teachersBlock: teachersBlockSchema,
  price: {
    type: Number,
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
  visibilityModules: {
    type: Boolean,
    default: true,
  },
  private: {
    type: Boolean,
    default: true,
  },
  description: String,
  image: String,
  headerImage: String,
})

CourseSchema.pre('deleteOne', async function (next) {
  const courseId = this._conditions._id

  const modulesId = await Module.distinct('_id', { course: courseId })

  await Module.deleteMany({ course: courseId })

  await Task.deleteMany({ module: { $in: modulesId } })
  await Lesson.deleteMany({ module: { $in: modulesId } })
  await Test.deleteMany({ module: { $in: modulesId } })

  next()
})

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course
