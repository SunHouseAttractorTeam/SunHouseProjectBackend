const mongoose = require('mongoose')

const { Schema } = mongoose

const TaskSchema = new Schema({
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

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task