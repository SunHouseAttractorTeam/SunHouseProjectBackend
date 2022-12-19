const mongoose = require('mongoose')

const { Schema } = mongoose

const bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10

const validateUnique = async value => {
  const user = await User.findOne({ email: value })

  if (user) return false
}

const validateEmail = value => {
  const pattern = /^([a-zA-Z0-9]+[_.]?[a-zA-Z0-9])+@([a-zA-Z]{2,5})\.([a-z]{2,3})(\.[a-z]{2,3})?$/

  if (!pattern.test(value)) return false
}

const MyCourses = new Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
})

const Tests = new Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
  },
  count: {
    type: Number,
    default: 0,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
})

const Lessons = new Schema({
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  },
  status: {
    type: Boolean,
    default: false,
  },
})

const Tasks = new Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
  },
  status: {
    type: Boolean,
    default: false,
  },
})

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      { validator: validateEmail, message: 'Email is not valid!' },
      { validator: validateUnique, message: 'kThis user is already registered' },
    ],
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  newPassword: {
    type: String,
    default: '',
  },
  facebookId: String,
  vkId: String,
  appleId: String,
  googleId: String,
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'teacher', 'admin', 'moderator'],
  },
  avatar: {
    type: String,
  },
  token: {
    type: String,
    required: true,
  },
  authentication: {
    type: Boolean,
    default: false,
  },
  myCourses: [MyCourses],
  tests: [Tests],
  lessons: [Lessons],
  tasks: [Tasks],
  resetPasswordToken: {
    type: String,
    default: '',
  },
  resetPasswordExpires: Date,
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
  this.password = await bcrypt.hash(this.password, salt)

  next()
})

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.password
    return ret
  },
})

UserSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', UserSchema)
module.exports = User
