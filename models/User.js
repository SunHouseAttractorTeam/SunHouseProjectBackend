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
      { validator: validateUnique, message: 'This user is already registered' },
    ],
  },
  password: {
    type: String,
    required: true,
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
  courses: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
      }
  ],
  count: [
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
      },
      count: {
        type: Number,
        default: 0
      },
    },
  ],
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
