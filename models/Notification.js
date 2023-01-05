const mongoose = require('mongoose')

const { Schema } = mongoose

const NotificationSchema = new Schema({
  description: {
    required: { message: 'Введите описание' },
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  view: {
    type: Boolean,
    default: false,
  },
})

const Notification = mongoose.model('Notification', NotificationSchema)

module.exports = Notification
