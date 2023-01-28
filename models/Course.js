const mongoose = require('mongoose')
const Module = require('./Module')
const Task = require('./Task')
const Lesson = require('./Lesson')
const Test = require('./Test')
const { deleteFile } = require('../middleweare/clearArrayFromFiles')

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
    default: 0,
  },
  instagram: {
    type: String,
  },
  review: {
    type: String,
  },
})

const CourseSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: { message: 'Введите название' },
  },
  rating: [RatingSchema],
  avgRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lendingTeachers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      description: String,
    },
  ],
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: { message: 'Выберете категорю' },
  },
  willLearn: [
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
  blockModules: {
    visibility: {
      type: Boolean,
      default: true,
    },
    description: { type: String, default: '' },
  },
  blockTeachers: {
    visibility: {
      type: Boolean,
      default: true,
    },
    description: { type: String, default: '' },
  },
  blockLearn: {
    visibility: {
      type: Boolean,
      default: true,
    },
    description: { type: String, default: '' },
  },
  private: {
    type: Boolean,
    default: true,
  },
  description: String,
  image: String,
  headerImage: String,
  pendingTasks: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      file: String,
      task: { type: Schema.Types.ObjectId, ref: 'Task' },
    },
  ],
})

CourseSchema.pre('deleteOne', async function (next) {
  const courseId = this._conditions._id

  const modulesId = await Module.distinct('_id', { course: courseId })

  await Module.deleteMany({ course: courseId })
  const tasksId = await Task.distinct('_id', { module: { $in: modulesId } })
  const testsId = await Test.distinct('_id', { module: { $in: modulesId } })
  const lessonsId = await Lesson.distinct('_id', { module: { $in: modulesId } })

  if (tasksId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of tasksId) {
      // eslint-disable-next-line no-await-in-loop
      const task = await Task.findById(id)

      if (task.file) deleteFile(task.file)

      if (task.data && task.data.length !== 0) {
        task.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  if (testsId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of testsId) {
      // eslint-disable-next-line no-await-in-loop
      const test = await Test.findById(id)

      if (test.file) deleteFile(test.file)

      if (test.data && test.data.length !== 0) {
        test.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  if (lessonsId.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const id of lessonsId) {
      // eslint-disable-next-line no-await-in-loop
      const lesson = await Lesson.findById(id)

      if (lesson.file) deleteFile(lesson.file)

      if (lesson.data && lesson.data.length !== 0) {
        lesson.data.forEach(obj => {
          if (obj.audio) deleteFile(obj.audio)
        })
      }
    }
  }

  await Task.deleteMany({ module: { $in: modulesId } })
  await Lesson.deleteMany({ module: { $in: modulesId } })
  await Test.deleteMany({ module: { $in: modulesId } })

  next()
})

const Course = mongoose.model('Course', CourseSchema)

module.exports = Course
