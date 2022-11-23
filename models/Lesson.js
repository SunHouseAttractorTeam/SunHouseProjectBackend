const mongoose = require('mongoose')

const { Schema } = mongoose

const LessonSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Module',
    },
    description: {
        required: true,
        type: String
    },
    file: String,
    video: String,
    audio: String
})

const Lesson = mongoose.model('Lesson', LessonSchema)

module.exports = Lesson